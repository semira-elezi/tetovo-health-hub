import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send, Bot, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

interface Message {
  role: "assistant" | "user";
  text: string;
  department?: string;
}

const symptomMap: Record<string, { dept: string; deptKey: string }> = {
  chest: { dept: "cardiology", deptKey: "Cardiology" },
  heart: { dept: "cardiology", deptKey: "Cardiology" },
  head: { dept: "neurology", deptKey: "Neurology" },
  dizzy: { dept: "neurology", deptKey: "Neurology" },
  child: { dept: "pediatrics", deptKey: "Pediatrics" },
  baby: { dept: "pediatrics", deptKey: "Pediatrics" },
  bone: { dept: "orthopedics", deptKey: "Orthopedics" },
  fracture: { dept: "orthopedics", deptKey: "Orthopedics" },
  stomach: { dept: "gastroenterology", deptKey: "Gastroenterology" },
  skin: { dept: "dermatology", deptKey: "Dermatology" },
  eye: { dept: "ophthalmology", deptKey: "Ophthalmology" },
  breath: { dept: "pulmonology", deptKey: "Pulmonology" },
  pregnant: { dept: "gynecology", deptKey: "Gynecology" },
};

export default function SymptomChecker() {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: t("symptom.greeting") },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const lower = input.toLowerCase();
    let found: { dept: string; deptKey: string } | null = null;
    for (const [keyword, info] of Object.entries(symptomMap)) {
      if (lower.includes(keyword)) {
        found = info;
        break;
      }
    }

    const response: Message = found
      ? {
          role: "assistant",
          text:
            language === "mk"
              ? `Врз основа на вашите симптоми, ви препорачувам да го посетите одделението за ${found.deptKey}.`
              : language === "sq"
              ? `Bazuar në simptomat tuaja, ju rekomandoj të vizitoni departamentin e ${found.deptKey}.`
              : `Based on your symptoms, I recommend visiting the ${found.deptKey} department.`,
          department: found.dept,
        }
      : {
          role: "assistant",
          text:
            language === "mk"
              ? "Ви препорачувам да го посетите одделението за итна помош за детален преглед."
              : language === "sq"
              ? "Ju rekomandoj të vizitoni departamentin e urgjencës për kontroll të detajuar."
              : "I recommend visiting the Emergency department for a thorough examination.",
          department: "emergency",
        };

    setTimeout(() => setMessages((prev) => [...prev, response]), 600);
    setInput("");
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <h1 className="text-2xl font-bold">{t("symptom.title")}</h1>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <p className="text-sm text-muted-foreground">{t("symptom.disclaimer")}</p>
        </div>

        {/* Chat */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="h-96 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p>{msg.text}</p>
                    {msg.department && (
                      <Button asChild size="sm" variant="secondary" className="mt-2">
                        <Link to={`/appointments`}>
                          {language === "mk" ? "Закажи термин" : language === "sq" ? "Rezervo termin" : "Book appointment"}
                        </Link>
                      </Button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder={t("symptom.placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
