import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Activity, Building2, FileText, Calendar, Shield, Trash2, Newspaper, Plus, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDoctors } from "@/hooks/useDoctors";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

/* ─── Add Doctor Dialog ─── */
function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: departments } = useDepartments();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    full_name: "", title: "", specialization: "", department_id: "",
    email: "", password: "", phone: "", bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.department_id || !form.email || !form.password) {
      toast.error("Name, department, email, and password are required"); return;
    }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await supabase.functions.invoke("register-doctor", { body: form });
    setLoading(false);
    if (res.error || res.data?.error) {
      toast.error("Failed to add doctor: " + (res.data?.error || res.error?.message));
    } else {
      toast.success(`Doctor added! Login: ${form.email} / ${form.password}`);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setForm({ full_name: "", title: "", specialization: "", department_id: "", email: "", password: "", phone: "", bio: "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus className="h-4 w-4" />Add Doctor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Register New Doctor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Dr. John Smith" /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Specialist" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments?.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name_en}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" /></div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Adding..." : "Add Doctor"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Add/Edit News Dialog ─── */
function NewsDialog({ article, onClose }: { article?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const isEdit = !!article;

  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "hospital_news",
    image_url: article?.image_url || "",
    author: article?.author || "",
    is_published: article?.is_published ?? false,
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: isEdit ? f.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    setLoading(true);

    const payload = {
      ...form,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("news").update(payload).eq("id", article.id));
    } else {
      ({ error } = await supabase.from("news").insert(payload));
    }

    setLoading(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(isEdit ? "Article updated!" : "Article created!");
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article title" />
      </div>
      <div className="space-y-2">
        <Label>Slug *</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="article-slug" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hospital_news">Hospital News</SelectItem>
              <SelectItem value="health_tips">Health Tips</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="announcements">Announcements</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Author</Label>
          <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Short summary..." />
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Full article content..." />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
        <Label>Publish immediately</Label>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
      </Button>
    </form>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
  const { profile } = useAuth();
  const { data: doctors, isLoading: doctorsLoading } = useDoctors();
  const { data: departments } = useDepartments();
  const queryClient = useQueryClient();

  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const { data: patients } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments")
        .select("*, doctors(full_name), departments(name_en)")
        .order("appointment_date", { ascending: false }).limit(20);
      if (error) throw error; return data;
    },
  });

  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const handleDeleteDoctor = async (id: string) => {
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) toast.error("Failed to delete: " + error.message);
    else { toast.success("Doctor removed"); queryClient.invalidateQueries({ queryKey: ["doctors"] }); }
  };

  const handleDeleteNews = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error("Failed to delete: " + error.message);
    else { toast.success("Article deleted"); queryClient.invalidateQueries({ queryKey: ["admin-news"] }); }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from("news").update({
      is_published: !current,
      published_at: !current ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(!current ? "Published!" : "Unpublished"); queryClient.invalidateQueries({ queryKey: ["admin-news"] }); }
  };

  const openEditDialog = (article: any) => {
    setEditingArticle(article);
    setNewsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    setNewsDialogOpen(true);
  };

  const closeNewsDialog = () => {
    setNewsDialogOpen(false);
    setEditingArticle(null);
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name || "Admin"}</p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5"><Shield className="h-3.5 w-3.5" />Admin</Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { icon: Users, value: doctors?.length || 0, label: "Doctors", color: "text-primary" },
            { icon: Building2, value: departments?.length || 0, label: "Departments", color: "text-accent" },
            { icon: Activity, value: patients?.length || 0, label: "Patients", color: "text-primary" },
            { icon: Newspaper, value: newsArticles?.length || 0, label: "News Articles", color: "text-accent" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="doctors">
          <TabsList>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="news" className="gap-1.5"><Newspaper className="h-3.5 w-3.5" />News</TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Manage Doctors</h2>
              <AddDoctorDialog />
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorsLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : !doctors?.length ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No doctors registered yet</TableCell></TableRow>
                    ) : doctors?.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title ? `${doc.title} ` : ""}{doc.full_name}</TableCell>
                        <TableCell>{doc.specialization || "—"}</TableCell>
                        <TableCell>{(doc as any).departments?.name_en || "—"}</TableCell>
                        <TableCell>{doc.email || "—"}</TableCell>
                        <TableCell><Badge variant={doc.is_active ? "default" : "secondary"}>{doc.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteDoctor(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Registered Patients</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>Date of Birth</TableHead><TableHead>Registered</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {!patients?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No patients yet</TableCell></TableRow>
                    ) : patients?.map((p) => (
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
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Doctor</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {!appointments?.length ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No appointments yet</TableCell></TableRow>
                    ) : appointments?.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.appointment_date} {a.start_time}</TableCell>
                        <TableCell>{(a as any).doctors?.full_name || "—"}</TableCell>
                        <TableCell>{(a as any).departments?.name_en || "—"}</TableCell>
                        <TableCell><Badge variant={a.status === "confirmed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"}>{a.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Manage News</h2>
              <Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" />Add Article</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : !newsArticles?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No articles yet. Click "Add Article" to create one.</TableCell></TableRow>
                    ) : newsArticles?.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">{article.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {article.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={article.is_published ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleTogglePublish(article.id, article.is_published)}
                          >
                            {article.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {article.published_at ? new Date(article.published_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(article.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* News Create/Edit Dialog */}
        <Dialog open={newsDialogOpen} onOpenChange={(v) => { if (!v) closeNewsDialog(); else setNewsDialogOpen(true); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Edit Article" : "Create New Article"}</DialogTitle>
            </DialogHeader>
            <NewsDialog article={editingArticle} onClose={closeNewsDialog} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
