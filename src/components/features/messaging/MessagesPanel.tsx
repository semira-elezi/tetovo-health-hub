import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const sb: any = supabase;

export default function PatientMessages() {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const isDoctor = roles.includes("doctor");
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Conversations: distinct peers
  const { data: peers, isLoading: peersLoading } = useQuery({
    queryKey: ["msg-peers", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await sb.from("messages").select("sender_id,recipient_id,body,created_at,is_read").or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (error) throw error;
      const seen = new Set<string>();
      const list: any[] = [];
      for (const m of data || []) {
        const peer = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
        if (seen.has(peer)) continue;
        seen.add(peer);
        list.push({ peer_id: peer, last: m.body, last_at: m.created_at });
      }
      // Fetch peer names
      const peerIds = list.map(l => l.peer_id);
      if (peerIds.length) {
        const { data: profs } = await sb.from("profiles").select("id,full_name").in("id", peerIds);
        const map = new Map((profs || []).map((p: any) => [p.id, p.full_name]));
        list.forEach(l => (l.name = map.get(l.peer_id) || "Unknown"));
      }
      return list;
    },
  });

  // Optional: list of doctors user can start a chat with
  const { data: contactables } = useQuery({
    queryKey: ["contactable", user?.id, isDoctor],
    enabled: !!user?.id,
    queryFn: async () => {
      if (isDoctor) {
        // Doctors can see patients they've had appointments with
        const { data: doc } = await sb.from("doctors").select("id").eq("user_id", user!.id).single();
        if (!doc) return [];
        const { data: appts } = await sb.from("appointments").select("patient_id").eq("doctor_id", doc.id);
        const ids = [...new Set((appts || []).map((a: any) => a.patient_id))];
        if (!ids.length) return [];
        const { data: profs } = await sb.from("profiles").select("id,full_name").in("id", ids);
        return (profs || []).map((p: any) => ({ id: p.id, name: p.full_name }));
      } else {
        const { data: docs } = await sb.from("doctors").select("user_id,full_name,title").not("user_id", "is", null).limit(50);
        return (docs || []).map((d: any) => ({ id: d.user_id, name: `${d.title || ""} ${d.full_name}`.trim() }));
      }
    },
  });

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["msg-thread", user?.id, activePeer],
    enabled: !!user?.id && !!activePeer,
    queryFn: async () => {
      const { data, error } = await sb.from("messages").select("*").or(`and(sender_id.eq.${user!.id},recipient_id.eq.${activePeer}),and(sender_id.eq.${activePeer},recipient_id.eq.${user!.id})`).order("created_at", { ascending: true });
      if (error) throw error;
      // mark as read
      await sb.from("messages").update({ is_read: true }).eq("recipient_id", user!.id).eq("sender_id", activePeer).eq("is_read", false);
      return data;
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const ch = sb.channel("messages-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
      qc.invalidateQueries({ queryKey: ["msg-peers"] });
      qc.invalidateQueries({ queryKey: ["msg-thread"] });
    }).subscribe();
    return () => { sb.removeChannel(ch); };
  }, [user?.id, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread]);

  const send = async () => {
    if (!body.trim() || !activePeer) return;
    const { error } = await sb.from("messages").insert({ sender_id: user!.id, recipient_id: activePeer, body });
    if (error) return toast.error(error.message);
    setBody("");
  };

  const peerList = peers || [];
  const showStartList = peerList.length === 0 || (contactables && contactables.length > 0);

  return (
    <Card><CardContent className="p-0">
      <div className="grid md:grid-cols-[260px_1fr] min-h-[500px]">
        <div className="border-r p-3 space-y-2 overflow-y-auto max-h-[500px]">
          <p className="text-xs font-semibold uppercase text-muted-foreground px-2">Conversations</p>
          {peersLoading ? <Skeleton className="h-10" /> : peerList.map((p: any) => (
            <button key={p.peer_id} onClick={() => setActivePeer(p.peer_id)}
              className={`w-full text-left rounded-lg p-2.5 text-sm transition-colors ${activePeer === p.peer_id ? "bg-secondary" : "hover:bg-muted"}`}>
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">{p.last}</p>
            </button>
          ))}
          {showStartList && (
            <>
              <p className="text-xs font-semibold uppercase text-muted-foreground px-2 pt-3">Start new</p>
              {(contactables || []).slice(0, 20).map((c: any) => (
                <button key={c.id} onClick={() => setActivePeer(c.id)}
                  className="w-full text-left rounded-lg p-2 text-sm hover:bg-muted">{c.name}</button>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col">
          {!activePeer ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center"><MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" /><p className="text-sm">Select a conversation</p></div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[440px]">
                {threadLoading ? <Skeleton className="h-20" /> : (thread || []).map((m: any) => {
                  const mine = m.sender_id === user!.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {m.body}
                        <p className={`text-[10px] mt-1 opacity-70`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-3 flex gap-2">
                <Input placeholder="Type a message..." value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
                <Button onClick={send} disabled={!body.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </CardContent></Card>
  );
}
