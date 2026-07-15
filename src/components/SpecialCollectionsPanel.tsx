"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { SpecialCollectionInfo } from "@/lib/types";

interface StudentEntry {
  id: string;
  name: string;
  nis: string;
}

interface SpecialCollectionsPanelProps {
  collections: SpecialCollectionInfo[];
  students: StudentEntry[];
}

export function SpecialCollectionsPanel({
  collections,
  students,
}: SpecialCollectionsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (collections.length === 0) return null;

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-start gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold">Iuran Khusus</h3>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Iuran non-rutin semester ini — klik untuk lihat siapa yang sudah bayar
          </p>
        </div>
      </div>

      {/* Daftar iuran */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {collections.map((col) => {
          const paidCount = col.paidIds.length;
          const pct = students.length > 0 ? (paidCount / students.length) * 100 : 0;
          const isOpen = expandedId === col.id;

          return (
            <div
              key={col.id}
              className={`rounded-3xl border-2 bg-background transition-colors ${
                isOpen ? "border-primary/50 md:col-span-2" : "border-border"
              }`}
            >
              <button
                onClick={() => toggle(col.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-extrabold">{col.name}</p>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-accent-foreground">
                      {formatRupiah(col.amount)}/siswa
                    </span>
                  </div>
                  {col.description && (
                    <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                      {col.description}
                    </p>
                  )}
                  {/* Progress */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold text-muted-foreground">
                      {paidCount}/{students.length}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Detail siswa */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-1.5 border-t-2 border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {students.map((std) => {
                        const hasPaid = col.paidIds.includes(std.id);
                        return (
                          <div
                            key={std.id}
                            className="flex items-center gap-2 rounded-xl bg-card px-3 py-2"
                          >
                            {hasPaid ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                              {std.name}
                            </span>
                            <span
                              className={`shrink-0 text-[10px] font-extrabold ${
                                hasPaid ? "text-success" : "text-destructive"
                              }`}
                            >
                              {hasPaid ? "Sudah" : "Belum"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
