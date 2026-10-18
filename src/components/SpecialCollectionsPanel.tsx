"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { SpecialCollectionInfo } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";

interface StudentEntry { id: string; name: string; nis: string; }
interface SpecialCollectionsPanelProps { collections: SpecialCollectionInfo[]; students: StudentEntry[]; }

export function SpecialCollectionsPanel({ collections, students }: SpecialCollectionsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const id = useId();
  if (collections.length === 0) return null;

  return (
    <section className="glass-panel glass-section h-full min-w-0">
      <SectionHeading eyebrow="Keperluan bersama" title="Iuran khusus" description="Pengumpulan dana di luar kas mingguan." />
      <div className="space-y-3">
        {collections.map((collection) => {
          const paidCount = collection.paidIds.length;
          const percentage = students.length > 0 ? Math.min(100, (paidCount / students.length) * 100) : 0;
          const isOpen = expandedId === collection.id;
          return (
            <div key={collection.id} className="collection-card" data-open={isOpen}>
              <button type="button" onClick={() => setExpandedId(isOpen ? null : collection.id)}
                aria-expanded={isOpen} aria-controls={`${id}-${collection.id}`} className="w-full p-5 text-left">
                <p className="text-[13px] font-semibold leading-relaxed">{collection.name}</p>
                <p className="mt-2 text-xl font-medium tracking-tight tabular-nums">{formatRupiah(collection.amount)}<span className="ml-1 text-[10px] font-normal tracking-normal text-muted-foreground">/ siswa</span></p>
                {collection.description && <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{collection.description}</p>}
                <div className="mt-5 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{ width: `${percentage}%` }} /></div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                  <span>{paidCount} dari {students.length} siswa membayar</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">Rincian<ChevronDown className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`${id}-${collection.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="max-h-72 overflow-y-auto border-t border-border px-5 py-2">
                      {students.map((student) => {
                        const paid = collection.paidIds.includes(student.id);
                        return <div key={student.id} className="collection-student"><span className="min-w-0 leading-relaxed">{student.name}</span><span className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${paid ? "text-[var(--tone-paid)]" : "text-muted-foreground"}`}>{paid && <Check className="size-3" />}{paid ? "Sudah" : "Belum"}</span></div>;
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
