// src/api/integrations.js

// ✅ هنا نفترض أنك ستنشئ Route في فيرسل: /api/llm يستدعي OpenAI أو أي مزوّد ذكاء اصطناعي
// ويمكنك تعديل مسار الـ API أو شكل البيانات كما تريد.

//
// دالة استدعاء نموذج الذكاء الاصطناعي
//
export async function InvokeLLM({ prompt, systemPrompt, ...rest } = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("InvokeLLM: الحقل prompt مفقود أو غير صالح.");
  }

  const res = await fetch("/api/llm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      ...rest,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text || `InvokeLLM failed with status ${res.status}`
    );
  }

  const data = await res.json().catch(() => ({}));

  // عدّل حسب ما ترجعه الـ API عندك
  return (
    data.result ||
    data.text ||
    data.content ||
    data.choices?.[0]?.message?.content ||
    data
  );
}

//
// باقي الدوال – حالياً مجرد Placeholders حتى تربطها بنفسك بـ Supabase أو Route خاص
// الكود لن ينكسر، لكن لو استُخدمت هذه الدوال سترمي Error واضح.
//

export async function SendEmail(_params) {
  throw new Error("SendEmail: لم يتم تنفيذ هذه الدالة بعد.");
}

export async function UploadFile(_params) {
  throw new Error("UploadFile: لم يتم تنفيذ هذه الدالة بعد.");
}

export async function GenerateImage(_params) {
  throw new Error("GenerateImage: لم يتم تنفيذ هذه الدالة بعد.");
}

export async function ExtractDataFromUploadedFile(_params) {
  throw new Error("ExtractDataFromUploadedFile: لم يتم تنفيذ هذه الدالة بعد.");
}

export async function CreateFileSignedUrl(_params) {
  throw new Error("CreateFileSignedUrl: لم يتم تنفيذ هذه الدالة بعد.");
}

export async function UploadPrivateFile(_params) {
  throw new Error("UploadPrivateFile: لم يتم تنفيذ هذه الدالة بعد.");
}

// نفس شكل الـ Core القديم لكن بدون Base44
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
};
