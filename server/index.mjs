/**
 * AI Clinic — خادم وسيط للذكاء الاصطناعي (Claude)
 *
 * هذا الخادم هو الجهة الوحيدة التي تحمل مفتاح Anthropic API —
 * لا يوضع المفتاح في تطبيق الموبايل أبداً.
 *
 * التشغيل:
 *   cd server && npm install && ANTHROPIC_API_KEY=sk-ant-... node index.mjs
 *
 * ثم في التطبيق:
 *   EXPO_PUBLIC_AI_API_URL=http://<your-server>:3000
 */
import Anthropic from '@anthropic-ai/sdk';
import http from 'node:http';

const client = new Anthropic(); // يقرأ ANTHROPIC_API_KEY من البيئة
const MODEL = 'claude-opus-4-8';
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `أنت مساعد طبي داخل تطبيق عيادات يستخدمه أطباء مرخّصون.
تكتب بالعربية الفصحى المبسطة وبأسلوب طبي مهني.
مخرجاتك مسودات يراجعها الطبيب دائماً — لست بديلاً عن قراره.
لا تخترع معلومات غير موجودة في المدخلات.`;

async function summarizeVisit(body) {
  const { patient, complaint, examNotes, diagnosis, vitals } = body;
  const vitalsText = Object.entries(vitals ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('، ');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `لخّص هذا الكشف الطبي في فقرة واحدة منظمة (المريض، الشكوى، العلامات الحيوية المهمة، الفحص، التشخيص، والتوصية العامة):

بيانات المريض: ${patient}
الشكوى: ${complaint || 'غير مذكورة'}
العلامات الحيوية: ${vitalsText || 'غير مسجلة'}
ملاحظات الفحص: ${examNotes || 'غير مذكورة'}
التشخيص: ${diagnosis || 'غير محدد'}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
  return { summary: text };
}

async function suggestPrescription(body) {
  const { patient, diagnosis, allergies = [], chronicDiseases = [] } = body;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `اقترح مسودة وصفة دوائية للتشخيص التالي، مع مراعاة الحساسية والأمراض المزمنة.
بيانات المريض: ${patient}
التشخيص: ${diagnosis}
حساسية دوائية: ${allergies.join('، ') || 'لا يوجد'}
أمراض مزمنة: ${chronicDiseases.join('، ') || 'لا يوجد'}

أضف في warnings أي تعارضات محتملة مع الحساسية أو الأمراض المزمنة، وذكّر بأن القرار النهائي للطبيب.`,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  drug: { type: 'string' },
                  dose: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['drug', 'dose', 'frequency', 'duration'],
                additionalProperties: false,
              },
            },
            instructions: { type: 'string' },
            warnings: { type: 'array', items: { type: 'string' } },
          },
          required: ['items', 'instructions', 'warnings'],
          additionalProperties: false,
        },
      },
    },
  });

  return response.parsed_output;
}

const routes = {
  '/ai/summarize-visit': summarizeVisit,
  '/ai/suggest-prescription': suggestPrescription,
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  const handler = routes[req.url];
  if (req.method !== 'POST' || !handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }

  try {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const result = await handler(JSON.parse(raw || '{}'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ai request failed' }));
  }
});

server.listen(PORT, () => {
  console.log(`AI Clinic proxy listening on http://localhost:${PORT}`);
});
