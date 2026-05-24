import { useState } from "react";
import { Facebook, Twitter, Link as LinkIcon, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShareButtons({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const native = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title, url: shareUrl }); } catch {}
    } else copy();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <span className="text-xs text-muted-foreground">Share:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer"
        className="rounded-full border p-2 hover:bg-muted transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer"
        className="rounded-full border p-2 hover:bg-muted transition-colors"><Twitter className="h-3.5 w-3.5" /></a>
      <button onClick={copy} className="rounded-full border p-2 hover:bg-muted transition-colors">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <LinkIcon className="h-3.5 w-3.5" />}
      </button>
      <Button variant="ghost" size="sm" onClick={native} className="md:hidden gap-1">
        <Share2 className="h-3.5 w-3.5" /> Share
      </Button>
    </div>
  );
}
