import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart, Activity, Scissors, Brain, Baby, Stethoscope,
  Droplets, Shield, Eye, Wind, Target, Search,
  Scan, Microscope, Pill, AlertCircle, Smile, Dumbbell,
  Volume2, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";

const allDepartments = [
  { slug: "cardiology", name: "Cardiology", desc: "Diagnosis and treatment of heart and vascular diseases.", icon: Heart, category: "Internal" },
  { slug: "interventional-cardiology", name: "Interventional Cardiology", desc: "Minimally invasive cardiac procedures and catheterization.", icon: Activity, category: "Internal" },
  { slug: "general-surgery-traumatology", name: "General Surgery & Traumatology", desc: "Surgical treatment of injuries and trauma.", icon: Scissors, category: "Surgery" },
  { slug: "general-visceral-surgery", name: "General and Visceral Surgery", desc: "Surgical procedures on abdominal and visceral organs.", icon: Scissors, category: "Surgery" },
  { slug: "neurosurgery", name: "Neurosurgery", desc: "Surgical treatment of brain, spine, and nervous system disorders.", icon: Brain, category: "Surgery" },
  { slug: "neurology", name: "Neurology", desc: "Diagnosis and treatment of neurological diseases.", icon: Brain, category: "Internal" },
  { slug: "orthopedics", name: "Orthopedics", desc: "Treatment of musculoskeletal disorders and joint surgery.", icon: Activity, category: "Surgery" },
  { slug: "maxillofacial-surgery", name: "Maxillofacial Surgery", desc: "Surgery of the jaw, face, and mouth.", icon: Smile, category: "Surgery" },
  { slug: "thoracic-surgery", name: "Thoracic Surgery", desc: "Surgery of the chest, lungs, and mediastinum.", icon: Wind, category: "Surgery" },
  { slug: "gynecology", name: "Gynecology & Obstetrics", desc: "Women's health, pregnancy, and childbirth.", icon: Baby, category: "Surgery" },
  { slug: "neonatology", name: "Neonatology", desc: "Care of newborns and premature infants.", icon: Baby, category: "Internal" },
  { slug: "neonatal-intensive-care", name: "Neonatal Intensive Care", desc: "Intensive care for critically ill newborns.", icon: Baby, category: "Emergency" },
  { slug: "pediatrics", name: "Department of Children's Diseases", desc: "Pediatric medicine and child healthcare.", icon: Baby, category: "Internal" },
  { slug: "internal-medicine", name: "Internal Medicine", desc: "Diagnosis and treatment of internal organ diseases.", icon: Stethoscope, category: "Internal" },
  { slug: "diabetes", name: "Diabetes & Metabolic Diseases", desc: "Management of diabetes and metabolic disorders.", icon: Droplets, category: "Internal" },
  { slug: "respiratory", name: "Respiratory Diseases", desc: "Diagnosis of lung and respiratory conditions.", icon: Wind, category: "Internal" },
  { slug: "psychiatry", name: "Psychiatry", desc: "Mental health diagnosis, treatment, and support.", icon: Brain, category: "Specialized" },
  { slug: "dermatovenerology", name: "Dermatovenerology", desc: "Skin diseases and sexually transmitted infections.", icon: Shield, category: "Specialized" },
  { slug: "ophthalmology", name: "Ophthalmology", desc: "Eye diseases and surgical vision correction.", icon: Eye, category: "Specialized" },
  { slug: "ent", name: "Otorinolaryngology (ENT)", desc: "Ear, nose, and throat diseases.", icon: Volume2, category: "Specialized" },
  { slug: "urology", name: "Urology", desc: "Urinary tract and male reproductive system disorders.", icon: Droplets, category: "Surgery" },
  { slug: "oncology", name: "Oncology", desc: "Diagnosis and cytostatic therapy of cancer.", icon: Target, category: "Internal" },
  { slug: "infectology", name: "Infectology", desc: "Treatment of infectious and parasitic diseases.", icon: Shield, category: "Internal" },
  { slug: "anesthesia-icu", name: "Anesthesia, Resuscitation & Intensive Care", desc: "Perioperative and critical care.", icon: Activity, category: "Emergency" },
  { slug: "physical-rehabilitation", name: "Physical Medicine & Rehabilitation", desc: "Physical therapy and functional recovery.", icon: Dumbbell, category: "Specialized" },
  { slug: "biochemical-lab", name: "Biochemical Laboratory Medicine", desc: "Laboratory diagnostics and analysis.", icon: Microscope, category: "Diagnostics" },
  { slug: "radiodiagnostics", name: "Radiodiagnostics", desc: "Medical imaging: X-ray, CT, MRI, ultrasound.", icon: Scan, category: "Diagnostics" },
  { slug: "forensic-medicine", name: "Forensic Medicine", desc: "Legal medical examinations and autopsies.", icon: Shield, category: "Diagnostics" },
  { slug: "pathological-anatomy", name: "Pathological Anatomy", desc: "Tissue analysis and histopathological diagnostics.", icon: Microscope, category: "Diagnostics" },
  { slug: "pharmacy", name: "Hospital Pharmacy", desc: "Dispensing and management of medications.", icon: Pill, category: "Specialized" },
  { slug: "emergency-medicine", name: "Emergency Medicine", desc: "24/7 emergency and acute care services.", icon: AlertCircle, category: "Emergency" },
];

export { allDepartments };

const categories = ["All", "Surgery", "Internal", "Diagnostics", "Emergency", "Specialized"];

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Reset animation when filters change
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [search, category]);

  const filtered = allDepartments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || d.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold md:text-4xl">Our 31 Departments</h1>

        {/* Search */}
        <div className="mt-8 relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl text-base"
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <Card
                key={dept.slug}
                className="card-hover rounded-2xl border shadow-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.3s ease ${i * 0.05}s, transform 0.3s ease ${i * 0.05}s`,
                }}
              >
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug">{dept.name}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{dept.desc}</p>
                  <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-xs text-primary">
                    <Link to={`/departments/${dept.slug}`}>View department</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
