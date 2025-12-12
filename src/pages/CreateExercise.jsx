import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/aiclient";   // ✅ ذكاء اصطناعي من aiclient
import { Exercise } from "@/api/entities";    // ✅ التعامل مع Supabase عبر entities

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Sparkles, Wand2, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const TOPICS = [
  { value: "آية قرآنية", label: "آية قرآنية" },
  { value: "الطبيعة", label: "نص عن الطبيعة" },
  { value: "التاريخ الإسلامي", label: "نص عن التاريخ الإسلامي" },
  { value: "العلوم", label: "نص علمي مبسط" },
  { value: "الأخلاق", label: "نص عن الأخلاق الحميدة" },
  { value: "القصص", label: "قصة قصيرة" },
  { value: "نص من اختيارك", label: "نص من اختيارك" },
  { value: "مخصص", label: "موضوع من اختياري" },
];

export default function CreateExercisePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [customText, setCustomText] = useState("");
  const [wordCount, setWordCount] = useState([80]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState(null);

const reviewAndCorrectText = async (originalText) => {
  try {
    setIsReviewing(true);
  
      const reviewPrompt = 
        أنت خبير في اللغة العربية والنحو. راجع النص التالي وصححه إذا لزم الأمر:
        
        "${originalText}"
        
        المطلوب:
        1. تصحيح أي أخطاء نحوية أو إملائية
        2. **التشكيل الكامل لكل حرف (Fully Vowelized):** يجب وضع الحركات (فتحة، ضمة، كسرة، سكون) على **جميع** الحروف بلا استثناء، وليس فقط أواخر الكلمات.
        3. التأكد من سلامة التراكيب والعبارات
        
        قواعد التشكيل المطلوبة (صارمة جداً):
        - ضع تشكيل على كل حرف متحرك أو ساكن.
        - ضع الشدّة ّ مع الحركة المناسبة على الحروف المشددة.
        - لا تترك أي حرف بدون تشكيل (إلا حروف المد الساكنة إن لزم).
        
        مثال صحيح: "الْعِلْمُ نُورٌ يُضِيءُ الطَّرِيقَ لِلْمُتَعَلِّمِينَ."
        
        أعد كتابة النص مُصححاً ومُشكولاً بالكامل، النص فقط بدون أي تعليقات.
      `;

      const correctedText = await InvokeLLM({
        prompt: reviewPrompt
      });

      if (typeof correctedText === "string" && correctedText.trim()) {
        return correctedText.trim();
      } else {
        return originalText;
      }
    } catch (error) {
      console.error("Text review failed:", error);
      return originalText;
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerate = async () => {
    try {
      if (!topic) {
        setError("يرجى اختيار نوع النص.");
        return;
      }

      if (topic === "نص من اختيارك" && !customText.trim()) {
        setError("يرجى كتابة النص الخاص بك.");
        return;
      }

      if (topic === "مخصص" && !customTopic.trim()) {
        setError("يرجى كتابة موضوعك.");
        return;
      }

      setError(null);
      setIsLoading(true);

      let finalText = "";

      // 📌 حالة: الطالب يكتب النص بنفسه
      if (topic === "نص من اختيارك") {
        finalText = await reviewAndCorrectText(customText.trim());
      } else {
        // 📌 حالة: الذكاء الاصطناعي ينشئ النص
        const finalTopic = topic === "مخصص" ? customTopic : topic;
        let prompt = "";

        if (topic === "آية قرآنية") {
          prompt = `
            اكتب آية قرآنية كريمة (صحيحة)، مع التشكيل الصحيح الكامل.
            الطول التقريبي: حوالي ${wordCount[0]} كلمة.

            الشروط:
            1. الآية من القرآن الكريم (نص صحيح).
            2. التشكيل الكامل على جميع الحروف قدر الإمكان.
            3. لا تكتب بسملة ولا رقم الآية.
            
            اكتب الآية فقط.
          `;
        } else {
          let complexity = "بسيط جداً (مستوى مبتدئ)";
          if (wordCount[0] > 150) complexity = "متقدم ومعقد (مستوى خبير)";
          else if (wordCount[0] > 80) complexity = "متوسط (جمل مركبة)";

          prompt = `
            أنت أستاذ لغة عربية خبير وضليع في النحو والصرف.
            المطلوب: إنشاء نص تعليمي باللغة العربية الفصحى حول موضوع "${finalTopic}".

            المستوى المطلوب: ${complexity}
            عدد الكلمات التقريبي: ${wordCount[0]}
            
            الشروط الصارمة جداً:
            1. **تشكيل كامل 100%:** كل حرف يجب أن يحمل حركة مناسبة أو سكون.
            2. **ضبط الإعراب:** تأكد من صحة حركات أواخر الكلمات حسب موقعها الإعرابي.
            3. **الشدة:** ضع الشدة مع الحركات المناسبة على الحروف المشددة.
            4. **اللغة سليمة وبسيطة قدر الإمكان للطلاب.

            المخرج: النص فقط، مشكولاً بالكامل، بدون أي عناوين أو شرح إضافي.
          `;
        }

        const generatedText = await InvokeLLM({ prompt });

        if (typeof generatedText !== "string" || generatedText.trim() === "") {
          throw new Error("فشل الذكاء الاصطناعي في إنشاء النص.");
        }

        finalText = await reviewAndCorrectText(generatedText.trim());
      }

      if (!finalText || finalText.length < 20) {
        throw new Error("النص المُنشأ قصير جداً أو غير صالح.");
      }

      // 📊 تقدير المستوى والمرحلة
      let level = "مبتدئ";
      let stage = 1;
      const actualWordCount = finalText.split(/\s+/).length;

      if (actualWordCount >= 150) {
        level = "متقدم";
        stage = Math.min(10, Math.floor(actualWordCount / 50));
      } else if (actualWordCount >= 100) {
        level = "متوسط";
        stage = Math.min(7, Math.floor(actualWordCount / 30));
      } else {
        stage = Math.min(5, Math.floor(actualWordCount / 20));
      }

      // 🗄 إنشاء التمرين في Supabase
      const newExercise = await Exercise.create({
        sentence: finalText,
        level: level,
        stage: stage,
        category: topic === "نص من اختيارك" ? "نص مخصص" : topic,
        difficulty_points: Math.round(actualWordCount / 10),
        word_count: actualWordCount
      });

      const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get("studentId");

      navigate(
        createPageUrl(`Exercise?id=${newExercise.id}&studentId=${studentId}`)
      );
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء التمرين. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent arabic-text flex items-center gap-2">
              <Wand2 className="text-purple-600" />
              تحدي إضافي - إنشاء تمرين مخصص
            </h1>
            <p className="text-indigo-600 arabic-text">
              اختر تفضيلاتك ليقوم الذكاء الاصطناعي بإنشاء نص للقراءة بجودة
              عالية.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm glow-effect">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
              <CardTitle className="arabic-text">حدد مواصفات النص</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 arabic-text mb-1">
                    ضمان الجودة
                  </h3>
                  <p className="text-sm text-green-700 arabic-text">
                    جميع النصوص تخضع لمراجعة تلقائية للتأكد من صحة القواعد
                    النحوية والتشكيل قبل عرضها.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="arabic-text text-lg font-semibold text-indigo-900"
                >
                  نوع النص
                </Label>
                <Select onValueChange={setTopic}>
                  <SelectTrigger
                    id="topic"
                    className="arabic-text h-12 border-2 border-indigo-200 rounded-xl"
                  >
                    <SelectValue placeholder="اختر نوع النص..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="arabic-text"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {topic === "نص من اختيارك" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="custom-text"
                    className="arabic-text text-lg font-semibold text-indigo-900 flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    اكتب أو الصق النص الخاص بك
                  </Label>
                  <Textarea
                    id="custom-text"
                    placeholder="اكتب أو الصق هنا النص الذي تريد التدرب عليه..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="arabic-text min-h-[150px] border-2 border-indigo-200 rounded-xl"
                  />
                  <p className="text-sm text-indigo-600 arabic-text">
                    سيتم مراجعة النص وتصحيح التشكيل والقواعد تلقائياً قبل إنشاء
                    التمرين.
                  </p>
                </motion.div>
              )}

              {topic === "مخصص" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="custom-topic"
                    className="arabic-text text-lg font-semibold text-indigo-900"
                  >
                    اكتب موضوعك هنا
                  </Label>
                  <Input
                    id="custom-topic"
                    placeholder="مثال: قصة عن الأمانة، فوائد القراءة، أهمية العلم..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="arabic-text h-12 border-2 border-indigo-200 rounded-xl"
                  />
                </motion.div>
              )}

              {topic && topic !== "نص من اختيارك" && (
                <div className="space-y-4">
                  <Label className="arabic-text text-lg font-semibold text-indigo-900">
                    عدد الكلمات (تقريباً {Math.round(wordCount[0] / 150)} دقيقة
                    قراءة)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={wordCount}
                      onValueChange={setWordCount}
                      min={50}
                      max={300}
                      step={25}
                      className="flex-1"
                    />
                    <span className="font-bold text-xl text-indigo-700 bg-indigo-100 px-4 py-2 rounded-lg min-w-[60px] text-center">
                      {wordCount[0]}
                    </span>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <p className="text-sm text-indigo-700 arabic-text">
                      <strong>المستوى:</strong>{" "}
                      {wordCount[0] >= 150
                        ? "متقدم"
                        : wordCount[0] >= 100
                        ? "متوسط"
                        : "مبتدئ"}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 arabic-text font-medium">
                    {error}
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isLoading || isReviewing}
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6 rounded-xl arabic-text shadow-2xl glow-effect"
              >
                {isLoading || isReviewing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    {isReviewing
                      ? "جارٍ المراجعة والتصحيح..."
                      : "جارٍ الإنشاء..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    {topic === "نص من اختيارك"
                      ? "مراجعة وإنشاء التمرين"
                      : "إنشاء نص محسّن"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
