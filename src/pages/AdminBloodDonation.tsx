import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplet, Send, AlertTriangle, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const LEVEL_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  low: "bg-amber-100 text-amber-700 border-amber-200",
  normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const URGENCY_COLOR: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-amber-500 text-white",
  normal: "bg-blue-500 text-white",
};

export default function AdminBloodDonation() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ blood_type: "O-", units_needed: 5, urgency: "high", message: "" });
  const [sending, setSending] = useState(false);

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["admin-blood-stock"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blood_stock").select("*").order("blood_type");
      if (error) throw error;
      return data;
    },
  });

  const { data: requests, isLoading: reqLoading } = useQuery({
    queryKey: ["admin-blood-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blood_donation_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns, isLoading: campLoading } = useQuery({
    queryKey: ["admin-blood-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blood_demand_campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: donorCounts } = useQuery({
    queryKey: ["admin-blood-donor-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const bt of BLOOD_TYPES) {
        const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("blood_type", bt as any);
        counts[bt] = count || 0;
      }
      return counts;
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, units, level }: { id: string; units: number; level: string }) => {
      const { error } = await supabase.from("blood_stock").update({ units, level, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blood-stock"] }); toast.success("Stock updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("blood_donation_requests").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blood-requests"] }); toast.success("Request updated"); },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("blood_demand_campaigns").insert({
        blood_type: campaignForm.blood_type as any,
        units_needed: campaignForm.units_needed,
        urgency: campaignForm.urgency,
        message: campaignForm.message || null,
        created_by: user!.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (campaign) => {
      qc.invalidateQueries({ queryKey: ["admin-blood-campaigns"] });
      setCampaignOpen(false);
      setSending(true);
      const t = toast.loading("Notifying donors...");
      try {
        const { data, error } = await supabase.functions.invoke("notify-blood-donors", { body: { campaign_id: campaign.id } });
        toast.dismiss(t);
        if (error) throw error;
        if (data?.contacted === 0) toast.warning("No matching donors found in the database");
        else toast.success(`Notified ${data?.contacted} donor(s) · ${data?.emails_sent || 0} email(s) sent`);
        qc.invalidateQueries({ queryKey: ["admin-blood-campaigns"] });
      } catch (e: any) {
        toast.dismiss(t);
        toast.error("Failed to notify donors: " + (e.message || "unknown"));
      } finally {
        setSending(false);
        setCampaignForm({ blood_type: "O-", units_needed: 5, urgency: "high", message: "" });
      }
    },
    onError: (e: any) => toast.error("Failed: " + e.message),
  });

  const closeCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blood_demand_campaigns").update({ status: "closed" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blood-campaigns"] }); toast.success("Campaign closed"); },
  });

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/auth/login" replace />;

  const pendingRequests = requests?.filter(r => r.status === "pending").length || 0;

  return (
    <Layout>
      <div className="container py-10 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Droplet className="h-7 w-7 text-red-500" />Blood Donation Management</h1>
            <p className="text-muted-foreground mt-1">Monitor stock levels, manage donor sign-ups, and request specific blood types.</p>
          </div>
          <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2"><Send className="h-4 w-4" />Request blood type</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Request blood from donors</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Blood type *</Label>
                    <Select value={campaignForm.blood_type} onValueChange={v => setCampaignForm({ ...campaignForm, blood_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{BLOOD_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Units needed *</Label>
                    <Input type="number" min={1} value={campaignForm.units_needed} onChange={e => setCampaignForm({ ...campaignForm, units_needed: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={campaignForm.urgency} onValueChange={v => setCampaignForm({ ...campaignForm, urgency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical (urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message (optional)</Label>
                  <Textarea rows={3} placeholder="e.g. Needed for emergency surgery tomorrow morning..." value={campaignForm.message} onChange={e => setCampaignForm({ ...campaignForm, message: e.target.value })} />
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium flex items-center gap-2"><Users className="h-4 w-4" />Potential donors in database</p>
                  <p className="text-muted-foreground mt-1">
                    {donorCounts ? `${donorCounts[campaignForm.blood_type] || 0} matching ${campaignForm.blood_type}${campaignForm.blood_type !== "O-" ? ` · ${donorCounts["O-"] || 0} universal (O-)` : ""}` : "Loading..."}
                  </p>
                </div>
                <Button onClick={() => createCampaign.mutate()} disabled={createCampaign.isPending || sending} className="w-full gap-2">
                  <Send className="h-4 w-4" />{createCampaign.isPending || sending ? "Sending notifications..." : "Send notifications to matching donors"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock grid */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Droplet className="h-5 w-5" />Current blood stock</CardTitle></CardHeader>
          <CardContent>
            {stockLoading ? <Skeleton className="h-32" /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stock?.map(s => (
                  <StockEditor key={s.id} stock={s} onSave={(units, level) => updateStock.mutate({ id: s.id, units, level })} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Donor sign-ups {pendingRequests > 0 && <Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>}</TabsTrigger>
            <TabsTrigger value="campaigns">Demand campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {reqLoading ? <Skeleton className="h-48 m-6" /> : !requests?.length ? (
                  <p className="text-center py-12 text-muted-foreground">No donor sign-ups yet</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead><TableHead>Blood type</TableHead><TableHead>Phone</TableHead>
                      <TableHead>City</TableHead><TableHead>Preferred date</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {requests.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.full_name}</TableCell>
                          <TableCell><Badge variant="outline">{r.blood_type}</Badge></TableCell>
                          <TableCell>{r.phone}</TableCell>
                          <TableCell>{r.city || "—"}</TableCell>
                          <TableCell>{r.preferred_date || "—"}</TableCell>
                          <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                          <TableCell>
                            <Select value={r.status} onValueChange={v => updateRequest.mutate({ id: r.id, status: v })}>
                              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {campLoading ? <Skeleton className="h-48 m-6" /> : !campaigns?.length ? (
                  <p className="text-center py-12 text-muted-foreground">No campaigns yet. Click "Request blood type" above to notify matching donors.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Created</TableHead><TableHead>Blood type</TableHead><TableHead>Units</TableHead>
                      <TableHead>Urgency</TableHead><TableHead>Contacted</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {campaigns.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>{format(new Date(c.created_at), "MMM d, HH:mm")}</TableCell>
                          <TableCell><Badge variant="outline" className="font-bold">{c.blood_type}</Badge></TableCell>
                          <TableCell>{c.units_needed}</TableCell>
                          <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLOR[c.urgency] || ""}`}>{c.urgency}</span></TableCell>
                          <TableCell className="font-medium">{c.contacted_count}</TableCell>
                          <TableCell><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                          <TableCell>
                            {c.status === "active" && (
                              <Button size="sm" variant="outline" onClick={() => closeCampaign.mutate(c.id)}>Close</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function StockEditor({ stock, onSave }: { stock: any; onSave: (units: number, level: string) => void }) {
  const [units, setUnits] = useState(stock.units);
  const [level, setLevel] = useState(stock.level);
  const dirty = units !== stock.units || level !== stock.level;

  return (
    <div className={`rounded-xl border p-4 ${LEVEL_COLOR[stock.level] || ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold">{stock.blood_type}</span>
        {stock.level === "critical" && <AlertTriangle className="h-5 w-5" />}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input type="number" min={0} value={units} onChange={e => setUnits(parseInt(e.target.value) || 0)} className="h-8 bg-white/70" />
          <span className="text-xs">units</span>
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="h-8 bg-white/70"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
        {dirty && <Button size="sm" className="w-full h-7" onClick={() => onSave(units, level)}>Save</Button>}
      </div>
    </div>
  );
}
