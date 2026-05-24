import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Send, Bot, User, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  text: string;
  department?: string | null;
}

const deptToSlug: Record<string, string> = {
  cardiology: "cardiology", neurology: "neurology", pediatrics: "pediatrics",
  orthopedics: "orthopedics", gastroenterology: "gastroenterology",
  dermatology: "dermatology", ophthalmology: "ophthalmology",
  pulmonology: "pulmonology", gynecology: "gynecology", urology: "urology",
  ent: "ent", endocrinology: "endocrinology", oncology: "oncology",
  psychiatry: "psychiatry", rheumatology: "rheumatology",
  "general medicine": "general-medicine", emergency: "emergency", surgery: "surgery",
};

export default function SymptomChecker() {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: t("symptom.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", text: input };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: {
          language,
          messages: nextHistory.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text,
          })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.text || "…", department: data.department || null },
      ]);
    } catch (e: any) {
      toast.error(e?.message || "AI request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            language === "sq"
              ? "Më vjen keq, nuk munda të përgjigjem tani. Ju lutemi provoni përsëri."
              : language === "mk"
              ? "Се извинувам, не можам да одговорам сега. Обидете се повторно."
              : "Sorry, I couldn't respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <h1 className="text-2xl font-bold">{t("symptom.title")}</h1>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <p className="text-sm text-muted-foreground">{t("symptom.disclaimer")}</p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="h-[28rem] overflow-y-auto space-y-4 pr-1">
              {messages.map((msg, i) => {
                const slug = msg.department ? deptToSlug[msg.department.toLowerCase()] : null;
                return (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p>{msg.text}</p>
                      {msg.department && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="secondary">
                            <Link to="/appointments">
                              {language === "mk" ? "Закажи термин" : language === "sq" ? "Rezervo termin" : "Book appointment"}
                            </Link>
                          </Button>
                          {slug && (
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/departments/${slug}`}>
                                {language === "mk" ? "За одделот" : language === "sq" ? "Rreth departamentit" : "About department"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder={t("symptom.placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
