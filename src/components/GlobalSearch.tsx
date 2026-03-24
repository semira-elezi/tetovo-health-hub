import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Stethoscope, Building2, Newspaper, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SERVICES = [
  { name: "Electrocardiogram", dept: "cardiology" },
  { name: "Echocardiography", dept: "cardiology" },
  { name: "Blood glucose test", dept: "laboratory" },
  { name: "Complete blood count", dept: "laboratory" },
  { name: "X-ray", dept: "radiodiagnostics" },
  { name: "CT scan", dept: "radiodiagnostics" },
  { name: "MRI", dept: "radiodiagnostics" },
  { name: "Ultrasound", dept: "radiodiagnostics" },
  { name: "Chemotherapy", dept: "oncology" },
  { name: "Physiotherapy session", dept: "rehabilitation" },
  { name: "Psychiatric evaluation", dept: "psychiatry" },
  { name: "Eye examination", dept: "ophthalmology" },
  { name: "Hearing test", dept: "ent" },
  { name: "Skin biopsy", dept: "dermatology" },
  { name: "Prenatal checkup", dept: "gynecology" },
  { name: "Newborn screening", dept: "neonatology" },
  { name: "Joint replacement consult", dept: "orthopedics" },
  { name: "Stress test", dept: "cardiology" },
  { name: "Sleep study", dept: "neurology" },
  { name: "Colonoscopy", dept: "visceral-surgery" },
];

const STORAGE_KEY = "hospital-recent-searches";

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDepartments([]);
      setDoctors([]);
      setNews([]);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setDepartments([]); setDoctors([]); setNews([]); return; }
    setLoading(true);
    const pattern = `%${q}%`;
    const [deptRes, docRes, newsRes] = await Promise.all([
      supabase.from("departments").select("name_en, slug, category").or(`name_en.ilike.${pattern},description_en.ilike.${pattern}`).limit(4),
      supabase.from("doctors").select("full_name, specialization, departments(name_en, slug)").or(`full_name.ilike.${pattern},specialization.ilike.${pattern}`).eq("is_active", true).limit(4),
      supabase.from("news").select("title, slug, category, published_at").ilike("title", pattern).eq("is_published", true).limit(3),
    ]);
    setDepartments(deptRes.data || []);
    setDoctors(docRes.data || []);
    setNews(newsRes.data || []);
    setLoading(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleNavigate = (path: string) => {
    if (query.trim()) saveSearch(query.trim());
    navigate(path);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const serviceResults = query.length >= 2
    ? SERVICES.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  const hasResults = departments.length > 0 || doctors.length > 0 || news.length > 0 || serviceResults.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="Search doctors, departments, services, news..."
            className="pl-12 pr-12 h-14 text-base rounded-2xl"
          />
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl border bg-card p-4 space-y-4">
          {query.length < 2 ? (
            recentSearches.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Recent Searches</span>
                  <button onClick={clearRecent} className="text-xs text-primary hover:underline">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(s => (
                    <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => { setQuery(s); doSearch(s); }}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Start typing to search...</p>
            )
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : !hasResults ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results for "{query}"</p>
          ) : (
            <>
              {departments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />Departments
                  </p>
                  {departments.map(d => (
                    <button key={d.slug} onClick={() => handleNavigate(`/departments/${d.slug}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center justify-between text-sm">
                      <span>{d.name_en}</span>
                      <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
                    </button>
                  ))}
                </div>
              )}
              {doctors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />Doctors
                  </p>
                  {doctors.map((d, i) => (
                    <button key={i} onClick={() => handleNavigate(`/departments/${(d as any).departments?.slug || ""}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm">
                      <span className="font-medium">{d.full_name}</span>
                      <span className="text-muted-foreground ml-2">{d.specialization} · {(d as any).departments?.name_en}</span>
                    </button>
                  ))}
                </div>
              )}
              {news.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                    <Newspaper className="h-3.5 w-3.5" />News
                  </p>
                  {news.map(n => (
                    <button key={n.slug} onClick={() => handleNavigate(`/news/${n.slug}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] shrink-0">{n.category.replace("_", " ")}</Badge>
                      <span>{n.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {serviceResults.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />Services
                  </p>
                  {serviceResults.map(s => (
                    <button key={s.name} onClick={() => handleNavigate(`/departments/${s.dept}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground ml-2">→ {s.dept}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
