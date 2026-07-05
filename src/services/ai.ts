import { Patient, PrescriptionItem, Vitals } from '../types';
import { ageFromBirthDate } from '../utils/dates';

/**
 * خدمة الذكاء الاصطناعي (Claude)
 *
 * لأسباب أمنية لا يوضع مفتاح Anthropic API داخل تطبيق الموبايل أبداً —
 * أي مفتاح مضمّن في التطبيق يمكن استخراجه من حزمة التطبيق.
 * الاتصال يتم عبر خادم وسيط (proxy) تملكه العيادة، وهو الذي يحمل المفتاح
 * ويستدعي Claude API. انظر مجلد `server/` لنموذج خادم جاهز.
 *
 * ضع رابط الخادم في متغير البيئة EXPO_PUBLIC_AI_API_URL
 * (مثال: https://api.your-clinic.com). إن لم يُضبط الرابط يعمل التطبيق
 * بوضع تجريبي محلي يولّد ملخصات مبدئية بدون شبكة.
 */
const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL;

export interface VisitSummaryInput {
  patient: Patient;
  complaint: string;
  examNotes: string;
  diagnosis: string;
  vitals: Vitals;
}

export interface PrescriptionSuggestion {
  items: PrescriptionItem[];
  instructions: string;
  warnings: string[];
}

async function callProxy<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`AI proxy error: ${res.status}`);
  }
  return (await res.json()) as T;
}

function patientContext(patient: Patient): string {
  const parts = [
    `الاسم: ${patient.name}`,
    `العمر: ${ageFromBirthDate(patient.birthDate)} سنة`,
    `النوع: ${patient.gender === 'male' ? 'ذكر' : 'أنثى'}`,
  ];
  if (patient.chronicDiseases.length) parts.push(`أمراض مزمنة: ${patient.chronicDiseases.join('، ')}`);
  if (patient.allergies.length) parts.push(`حساسية من: ${patient.allergies.join('، ')}`);
  return parts.join(' — ');
}

/** تلخيص الكشف: يحوّل ملاحظات الطبيب إلى ملخص طبي منظم */
export async function summarizeVisit(input: VisitSummaryInput): Promise<string> {
  if (AI_API_URL) {
    const result = await callProxy<{ summary: string }>('/ai/summarize-visit', {
      patient: patientContext(input.patient),
      complaint: input.complaint,
      examNotes: input.examNotes,
      diagnosis: input.diagnosis,
      vitals: input.vitals,
    });
    return result.summary;
  }
  return localSummarize(input);
}

/** اقتراح وصفة مبدئية بناء على التشخيص — يراجعها الطبيب دائماً قبل الاعتماد */
export async function suggestPrescription(
  patient: Patient,
  diagnosis: string,
): Promise<PrescriptionSuggestion> {
  if (AI_API_URL) {
    return callProxy<PrescriptionSuggestion>('/ai/suggest-prescription', {
      patient: patientContext(patient),
      diagnosis,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
    });
  }
  return localSuggestPrescription(patient, diagnosis);
}

/* ------------------------------------------------------------------ */
/* الوضع التجريبي المحلي (بدون خادم): صياغة قوالب منظمة من المدخلات     */
/* ------------------------------------------------------------------ */

function localSummarize(input: VisitSummaryInput): string {
  const { patient, complaint, examNotes, diagnosis, vitals } = input;
  const age = ageFromBirthDate(patient.birthDate);
  const gender = patient.gender === 'male' ? 'ذكر' : 'أنثى';

  const lines: string[] = [];
  lines.push(`مريض ${gender}، ${age} سنة${patient.chronicDiseases.length ? `، معروف بـ${patient.chronicDiseases.join(' و')}` : ''}.`);
  if (complaint.trim()) lines.push(`الشكوى: ${complaint.trim()}.`);

  const vitalParts: string[] = [];
  if (vitals.bloodPressure) vitalParts.push(`الضغط ${vitals.bloodPressure}`);
  if (vitals.heartRate) vitalParts.push(`النبض ${vitals.heartRate}`);
  if (vitals.temperature) vitalParts.push(`الحرارة ${vitals.temperature}°`);
  if (vitals.weight) vitalParts.push(`الوزن ${vitals.weight} كجم`);
  if (vitalParts.length) lines.push(`العلامات الحيوية: ${vitalParts.join('، ')}.`);

  if (examNotes.trim()) lines.push(`الفحص الإكلينيكي: ${examNotes.trim()}.`);
  if (diagnosis.trim()) lines.push(`التشخيص: ${diagnosis.trim()}.`);
  if (patient.allergies.length) lines.push(`تنبيه: المريض لديه حساسية من ${patient.allergies.join('، ')}.`);
  lines.push('(ملخص مبدئي مُولَّد محلياً — فعّل خادم الذكاء الاصطناعي للحصول على تلخيص Claude الكامل)');

  return lines.join('\n');
}

function localSuggestPrescription(patient: Patient, diagnosis: string): PrescriptionSuggestion {
  const warnings: string[] = [];
  if (patient.allergies.length) {
    warnings.push(`المريض لديه حساسية من: ${patient.allergies.join('، ')} — تجنب الأدوية ذات الصلة.`);
  }
  if (patient.chronicDiseases.length) {
    warnings.push(`مراعاة الأمراض المزمنة: ${patient.chronicDiseases.join('، ')}.`);
  }
  warnings.push('هذا اقتراح مبدئي فقط — القرار الدوائي النهائي مسؤولية الطبيب.');

  return {
    items: [
      {
        drug: `دواء مناسب لـ"${diagnosis || 'التشخيص'}"`,
        dose: 'حسب تقدير الطبيب',
        frequency: 'حسب الإرشادات العلاجية',
        duration: 'حسب الحالة',
      },
    ],
    instructions: 'فعّل خادم الذكاء الاصطناعي (EXPO_PUBLIC_AI_API_URL) للحصول على اقتراحات دوائية مفصلة من Claude.',
    warnings,
  };
}

export const aiEnabled = Boolean(AI_API_URL);
