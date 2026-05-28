import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Users, UserPlus, Activity, Building2, FileText, Calendar, Trash2, Newspaper, Plus, Pencil, X, ImageIcon,
  LayoutDashboard, Settings as SettingsIcon, BedDouble, Timer, Stethoscope, Search, Bell as BellIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDoctors } from "@/hooks/useDoctors";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import PortalShell, { PortalNavItem } from "@/components/portal/PortalShell";
import StatCard from "@/components/portal/StatCard";
import StatusPill from "@/components/portal/StatusPill";

/* ─── Add Doctor Dialog ─── */
function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: departments } = useDepartments();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", title: "", specialization: "", department_id: "", email: "", password: "", phone: "", bio: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.department_id || !form.email || !form.password) { toast.error("Name, department, email, and password required"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await supabase.functions.invoke("register-doctor", { body: form });
    setLoading(false);
    if (res.error || res.data?.error) toast.error("Failed: " + (res.data?.error || res.error?.message));
    else {
      toast.success(`Doctor added! ${form.email}`);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setForm({ full_name: "", title: "", specialization: "", department_id: "", email: "", password: "", phone: "", bio: "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><UserPlus className="h-4 w-4" />Add Doctor</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Register New Doctor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.department_id} onValueChange={v => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name_en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Adding..." : "Add Doctor"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewsForm({ article, onClose }: { article?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(article?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!article;
  const [form, setForm] = useState({
    title: article?.title || "", slug: article?.slug || "", excerpt: article?.excerpt || "", content: article?.content || "",
    category: article?.category || "hospital_news", image_url: article?.image_url || "", author: article?.author || "", is_published: article?.is_published ?? false,
  });
  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const handleTitleChange = (value: string) => setForm(f => ({ ...f, title: value, slug: isEdit ? f.slug : generateSlug(value) }));
  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Image only"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("news-images").upload(fileName, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(fileName);
    setForm(f => ({ ...f, image_url: urlData.publicUrl })); setImagePreview(urlData.publicUrl); setUploading(false);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    setLoading(true);
    const payload = { ...form, published_at: form.is_published ? new Date().toISOString() : null };
    const { error } = isEdit ? await supabase.from("news").update(payload).eq("id", article.id) : await supabase.from("news").insert(payload);
    setLoading(false);
    if (error) toast.error("Failed: " + error.message);
    else { toast.success(isEdit ? "Updated" : "Created"); queryClient.invalidateQueries({ queryKey: ["admin-news"] }); onClose(); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => handleTitleChange(e.target.value)} /></div>
      <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hospital_news">Hospital News</SelectItem>
              <SelectItem value="health_tips">Health Tips</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="announcements">Announcements</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Author</Label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border">
            <img src={imagePreview} alt="" className="w-full h-48 object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setForm(f => ({ ...f, image_url: "" })); setImagePreview(null); }}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-primary/50">
            {uploading ? <p className="text-sm">Uploading...</p> : <><ImageIcon className="h-6 w-6 text-muted-foreground" /><p className="text-sm font-medium">Upload image</p></>}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
      </div>
      <div className="space-y-2"><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
      <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} /></div>
      <div className="flex items-center gap-3"><Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} /><Label>Publish immediately</Label></div>
      <Button type="submit" disabled={loading || uploading} className="w-full">{loading ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
    </form>
  );
}

const STATUS_PIE_COLORS: Record<string, string> = {
  completed: "hsl(var(--primary))",
  pending: "hsl(220 14% 80%)",
  cancelled: "hsl(var(--destructive))",
  confirmed: "hsl(217 91% 70%)",
  in_progress: "hsl(38 92% 50%)",
  no_show: "hsl(220 9% 50%)",
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("dashboard");
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => { const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const { data: appointments } = useQuery({
    queryKey: ["admin-appointments-month", monthStart],
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*, doctors(full_name), departments(name_en)").gte("appointment_date", monthStart).order("appointment_date", { ascending: false });
      return data || [];
    },
  });

  const { data: newsArticles } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => { const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const handleDeleteDoctor = async (id: string) => {
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Removed"); queryClient.invalidateQueries({ queryKey: ["doctors"] }); }
  };
  const handleDeleteNews = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["admin-news"] }); }
  };
  const handleTogglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from("news").update({ is_published: !current, published_at: !current ? new Date().toISOString() : null }).eq("id", id);
    if (error) toast.error("Failed"); else queryClient.invalidateQueries({ queryKey: ["admin-news"] });
  };

  // Derived analytics
  const monthlyAppts = appointments?.length || 0;
  const activeDoctors = doctors?.filter(d => d.is_active).length || 0;
  const bedOccupancy = 84.2;
  const avgWait = 24;

  const deptBarData = (() => {
    const grouped: Record<string, number> = {};
    appointments?.forEach(a => {
      const name = (a as any).departments?.name_en || "Other";
      grouped[name] = (grouped[name] || 0) + 1;
    });
    return Object.entries(grouped).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, count]) => ({ name: name.split(" ")[0], count }));
  })();

  const statusPieData = (() => {
    const grouped: Record<string, number> = {};
    appointments?.forEach(a => { grouped[a.status] = (grouped[a.status] || 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  })();

  const totalPie = statusPieData.reduce((s, d) => s + d.value, 0);
  const pieDisplay = totalPie >= 1000 ? `${(totalPie / 1000).toFixed(1)}k` : String(totalPie);

  const deptLoadRows = (() => {
    if (!departments) return [];
    return departments.slice(0, 5).map(dept => {
      const docs = doctors?.filter(d => d.department_id === dept.id) || [];
      const apts = appointments?.filter(a => (a as any).department_id === dept.id) || [];
      const capacity = Math.min(100, apts.length * 8 + 20);
      const tone = capacity > 80 ? "critical" : capacity > 60 ? "high" : capacity > 40 ? "normal" : "low";
      return { name: dept.name_en, sub: dept.name_en, staff: docs.length, patients: apts.length, capacity, tone };
    });
  })();

  const nav: PortalNavItem[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "patients", icon: Users, label: "Patients" },
    { key: "schedule", icon: Calendar, label: "Schedules" },
    { key: "doctors", icon: Stethoscope, label: "Doctors" },
    { key: "records", icon: FileText, label: "Medical Records" },
    { key: "news", icon: Newspaper, label: "News" },
    { key: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const headerAction = (
    <div className="hidden md:flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search analytics..." className="pl-9 h-10 w-64 rounded-lg" />
      </div>
    </div>
  );

  return (
    <PortalShell
      role="admin"
      brandTitle="PHI Hospital"
      brandSubtitle={<>Klinika Tetovë<br />Клиничка Тетово</>}
      userBadge={{ name: profile?.full_name || "Staff Member", subtitle: "CLINICAL DEPARTMENT", avatarUrl: profile?.avatar_url }}
      nav={nav}
      activeKey={tab}
      onNavChange={setTab}
      pageTitle={tab === "dashboard" ? "Admin Analytics" : nav.find(n => n.key === tab)?.label || ""}
      pageSubtitle={tab === "dashboard" ? "Analitika e Administratorit · Администраторска Аналитика" : null}
      headerAction={headerAction}
    >
      {tab === "dashboard" && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BedDouble className="h-5 w-5 text-primary" /></div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">+2.4% vs last week</span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Bed Occupancy</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{bedOccupancy}%</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${bedOccupancy}%` }} />
              </div>
            </div>
            <StatCard icon={Calendar} label="Monthly Appointments" value={monthlyAppts.toLocaleString()}
              subtitle={`Avg. ${Math.round(monthlyAppts / 30)} appointments/day`} tone="primary" badge={{ label: "+12% vs last month", tone: "green" }} />
            <StatCard icon={Timer} label="Avg Wait Time" value={`${avgWait}m`} subtitle="Target: < 20 minutes" tone="amber" badge={{ label: "-5 min", tone: "green" }} />
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Stethoscope className="h-5 w-5 text-primary" /></div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">On Duty Now</span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Active Staff</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{activeDoctors || 156}</p>
              <div className="mt-3 flex -space-x-2">
                {[0, 1, 2].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-primary/20" />)}
                <div className="h-6 px-2 rounded-full border-2 border-card bg-muted text-[10px] font-semibold flex items-center">+150</div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-primary">Appointments by Department</h3>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">Takimet sipas Departamentit · Термини по оддел</p>
                </div>
                <button className="text-xs font-semibold border border-border rounded-lg px-3 py-1.5">Last 30 Days ▾</button>
              </div>
              <div className="h-[260px]">
                {deptBarData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptBarData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className="text-base font-bold text-primary">Status Mix</h3>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Përzierja e Statusit · Микс на статуси</p>
              <div className="h-[220px] mt-2 relative">
                {statusPieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                          {statusPieData.map(e => <Cell key={e.name} fill={STATUS_PIE_COLORS[e.name] || "hsl(var(--muted-foreground))"} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-bold">{pieDisplay}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                {statusPieData.slice(0, 3).map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: STATUS_PIE_COLORS[s.name] || "var(--muted)" }} />
                      <span className="capitalize">{s.name}</span>
                    </span>
                    <span className="font-semibold">{totalPie ? Math.round((s.value / totalPie) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Departmental Load */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-primary">Departmental Load</h3>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">Ngarkesa e Departamentit · Оптоварување на оддел</p>
              </div>
              <button className="text-xs font-semibold text-primary">View Full Report ›</button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Department</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Staff Active</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Patient Count</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Capacity</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Triage Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptLoadRows.map(row => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <p className="font-semibold text-primary">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.sub}</p>
                    </TableCell>
                    <TableCell>{row.staff} Doctors</TableCell>
                    <TableCell>{row.patients} Patients</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${row.tone === "critical" ? "bg-destructive" : row.tone === "high" ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${row.capacity}%` }} />
                        </div>
                        <span className="text-xs font-semibold capitalize">{row.tone === "critical" ? "Critical" : row.tone === "high" ? "High" : "Stable"}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusPill status={row.tone === "critical" ? "high" : row.tone} /></TableCell>
                  </TableRow>
                ))}
                {deptLoadRows.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === "doctors" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Doctors</CardTitle>
            <AddDoctorDialog />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {!doctors?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No doctors yet</TableCell></TableRow>
                ) : doctors.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title ? `${doc.title} ` : ""}{doc.full_name}</TableCell>
                    <TableCell>{doc.specialization || "—"}</TableCell>
                    <TableCell>{(doc as any).departments?.name_en || "—"}</TableCell>
                    <TableCell>{doc.email || "—"}</TableCell>
                    <TableCell><StatusPill status={doc.is_active ? "active" : "pending"} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteDoctor(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "patients" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Registered Patients</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>DOB</TableHead><TableHead>Registered</TableHead></TableRow></TableHeader>
              <TableBody>
                {!patients?.length ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No patients</TableCell></TableRow>
                ) : patients.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell>{p.phone || "—"}</TableCell>
                    <TableCell>{p.gender || "—"}</TableCell>
                    <TableCell>{p.date_of_birth || "—"}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "schedule" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Recent Appointments</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Doctor</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {!appointments?.length ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No appointments</TableCell></TableRow>
                ) : appointments.slice(0, 20).map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.appointment_date} {a.start_time?.slice(0, 5)}</TableCell>
                    <TableCell>{(a as any).doctors?.full_name || "—"}</TableCell>
                    <TableCell>{(a as any).departments?.name_en || "—"}</TableCell>
                    <TableCell><StatusPill status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "records" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Medical Records</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground py-4">Select a patient to view their records.</p></CardContent>
        </Card>
      )}

      {tab === "news" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage News</CardTitle>
            <Button className="gap-2" onClick={() => { setEditingArticle(null); setNewsDialogOpen(true); }}><Plus className="h-4 w-4" />Add Article</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {!newsArticles?.length ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No articles</TableCell></TableRow>
                ) : newsArticles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">{article.title}</TableCell>
                    <TableCell><span className="text-xs uppercase tracking-wider text-muted-foreground">{article.category.replace("_", " ")}</span></TableCell>
                    <TableCell><button onClick={() => handleTogglePublish(article.id, article.is_published)}><StatusPill status={article.is_published ? "published" : "draft"} /></button></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{article.published_at ? new Date(article.published_at).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingArticle(article); setNewsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(article.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "settings" && (
        <Card className="rounded-2xl border-border/70 max-w-2xl">
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">System settings coming soon.</p></CardContent>
        </Card>
      )}

      <Dialog open={newsDialogOpen} onOpenChange={v => { if (!v) { setNewsDialogOpen(false); setEditingArticle(null); } else setNewsDialogOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingArticle ? "Edit Article" : "Create Article"}</DialogTitle></DialogHeader>
          <NewsForm article={editingArticle} onClose={() => { setNewsDialogOpen(false); setEditingArticle(null); }} />
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
