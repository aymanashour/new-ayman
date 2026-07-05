import { Appointment, Clinic, Doctor, FollowUpTask, Patient, Prescription, Specialty, Visit } from '../types';
import { todayISO } from '../utils/dates';

export const specialties: Specialty[] = [
  { id: 'sp_internal', name: 'باطنة', icon: 'medkit-outline' },
  { id: 'sp_cardio', name: 'قلب وأوعية', icon: 'heart-outline' },
  { id: 'sp_derma', name: 'جلدية', icon: 'body-outline' },
  { id: 'sp_dental', name: 'أسنان', icon: 'happy-outline' },
  { id: 'sp_pedia', name: 'أطفال', icon: 'accessibility-outline' },
  { id: 'sp_ortho', name: 'عظام', icon: 'fitness-outline' },
  { id: 'sp_eye', name: 'عيون', icon: 'eye-outline' },
  { id: 'sp_ent', name: 'أنف وأذن', icon: 'ear-outline' },
];

const DEFAULT_SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

export const clinics: Clinic[] = [
  { id: 'cl_1', name: 'عيادة الشفاء للباطنة', specialtyId: 'sp_internal', address: 'شارع الجمهورية، وسط البلد', phone: '01000000001', rating: 4.8, workingHours: 'يومياً 10ص - 9م', slots: DEFAULT_SLOTS },
  { id: 'cl_2', name: 'مركز القلب التخصصي', specialtyId: 'sp_cardio', address: 'شارع النيل، المعادي', phone: '01000000002', rating: 4.9, workingHours: 'السبت - الخميس 11ص - 8م', slots: DEFAULT_SLOTS },
  { id: 'cl_3', name: 'عيادة النضارة للجلدية', specialtyId: 'sp_derma', address: 'ميدان المحطة، المنصورة', phone: '01000000003', rating: 4.6, workingHours: 'يومياً 12م - 10م', slots: DEFAULT_SLOTS },
  { id: 'cl_4', name: 'مركز الابتسامة للأسنان', specialtyId: 'sp_dental', address: 'شارع التحرير، الدقي', phone: '01000000004', rating: 4.7, workingHours: 'يومياً 10ص - 10م', slots: DEFAULT_SLOTS },
  { id: 'cl_5', name: 'عيادة البراعم للأطفال', specialtyId: 'sp_pedia', address: 'شارع فيصل، الجيزة', phone: '01000000005', rating: 4.8, workingHours: 'يومياً 4م - 11م', slots: DEFAULT_SLOTS },
  { id: 'cl_6', name: 'مركز الحركة للعظام', specialtyId: 'sp_ortho', address: 'شارع عباس العقاد، مدينة نصر', phone: '01000000006', rating: 4.5, workingHours: 'السبت - الخميس 1م - 9م', slots: DEFAULT_SLOTS },
];

export const doctors: Doctor[] = [
  { id: 'dr_1', name: 'د. أيمن عاشور', clinicId: 'cl_1', title: 'استشاري الباطنة العامة' },
  { id: 'dr_2', name: 'د. سارة محمود', clinicId: 'cl_2', title: 'استشاري أمراض القلب' },
  { id: 'dr_3', name: 'د. محمد عادل', clinicId: 'cl_3', title: 'أخصائي الأمراض الجلدية' },
  { id: 'dr_4', name: 'د. هالة يوسف', clinicId: 'cl_4', title: 'أخصائي طب وجراحة الفم والأسنان' },
  { id: 'dr_5', name: 'د. أحمد سمير', clinicId: 'cl_5', title: 'استشاري طب الأطفال' },
  { id: 'dr_6', name: 'د. خالد فتحي', clinicId: 'cl_6', title: 'استشاري جراحة العظام' },
];

export const patients: Patient[] = [
  {
    id: 'pt_1', name: 'محمود حسن', phone: '01111111111', birthDate: '1985-04-12', gender: 'male',
    bloodType: 'A+', allergies: ['البنسلين'], chronicDiseases: ['ضغط الدم المرتفع'],
    notes: 'يتابع الضغط منذ 2019',
  },
  {
    id: 'pt_2', name: 'فاطمة علي', phone: '01222222222', birthDate: '1992-09-03', gender: 'female',
    bloodType: 'O+', allergies: [], chronicDiseases: ['سكري النوع الثاني'],
  },
  {
    id: 'pt_3', name: 'يوسف إبراهيم', phone: '01333333333', birthDate: '2015-01-20', gender: 'male',
    bloodType: 'B+', allergies: ['المكسرات'], chronicDiseases: [],
  },
  {
    id: 'pt_4', name: 'منى صلاح', phone: '01444444444', birthDate: '1978-11-30', gender: 'female',
    bloodType: 'AB-', allergies: [], chronicDiseases: ['ربو'],
  },
];

const today = todayISO();

export const appointments: Appointment[] = [
  {
    id: 'ap_1', clinicId: 'cl_1', doctorId: 'dr_1', patientId: 'pt_1',
    date: today, time: '18:00', reason: 'متابعة ضغط الدم', status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ap_2', clinicId: 'cl_1', doctorId: 'dr_1', patientId: 'pt_2',
    date: today, time: '18:30', reason: 'ارتفاع سكر الدم وإرهاق عام', status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ap_3', clinicId: 'cl_1', doctorId: 'dr_1', patientId: 'pt_4',
    date: today, time: '19:00', reason: 'كحة مستمرة وضيق تنفس', status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

export const visits: Visit[] = [
  {
    id: 'vs_1', patientId: 'pt_1', doctorId: 'dr_1',
    date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    complaint: 'صداع متكرر ودوخة خفيفة',
    examNotes: 'ضغط الدم مرتفع نسبياً، لا يوجد وذمة بالأطراف، أصوات القلب طبيعية',
    diagnosis: 'ارتفاع ضغط الدم غير المنضبط',
    vitals: { bloodPressure: '150/95', heartRate: '82', temperature: '37.0', weight: '88' },
    aiSummary: 'مريض ذكر 40 عاماً معروف بارتفاع ضغط الدم، حضر بشكوى صداع ودوخة. القياسات أظهرت ضغط 150/95. تم تعديل جرعة الدواء وينصح بمتابعة الضغط منزلياً وتقليل الملح.',
  },
];

export const prescriptions: Prescription[] = [
  {
    id: 'rx_1', visitId: 'vs_1', patientId: 'pt_1', doctorId: 'dr_1',
    date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    diagnosis: 'ارتفاع ضغط الدم',
    items: [
      { drug: 'أملوديبين 5 ملجم', dose: 'قرص واحد', frequency: 'مرة يومياً صباحاً', duration: 'شهر' },
      { drug: 'أسبرين 81 ملجم', dose: 'قرص واحد', frequency: 'مرة يومياً بعد الغداء', duration: 'مستمر' },
    ],
    instructions: 'قياس الضغط يومياً وتسجيله، تقليل الملح في الطعام',
  },
];

export const followUps: FollowUpTask[] = [
  {
    id: 'fu_1', patientId: 'pt_1', doctorId: 'dr_1',
    title: 'متابعة قراءات ضغط الدم الأسبوعية',
    dueDate: today, done: false,
    notes: 'التأكد من انتظام القراءات بعد تعديل الجرعة',
  },
  {
    id: 'fu_2', patientId: 'pt_2', doctorId: 'dr_1',
    title: 'مراجعة تحليل السكر التراكمي HbA1c',
    dueDate: today, done: false,
  },
];
