"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "@/lib/mock-data";
import { useState } from "react";

interface SpecialCollectionPayment {
  studentId: string;
}

interface SpecialCollectionItem {
  id: string;
  name: string;
  amount: number;
  description?: string;
  createdAt: string;
  payments: SpecialCollectionPayment[];
}

interface StudentEntry {
  id: string;
  name: string;
  nis: string;
}

interface SpecialCollectionsPanelProps {
  collections: SpecialCollectionItem[];
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <ClipboardList className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Iuran Khusus</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground pl-10">
          Daftar iuran non-rutin semester ini — klik untuk lihat detail
        </p>
      </div>

      {/* Collections List */}
      <div className="space-y-3">
        {collections.map((col, idx) => {
          const paidIds = new Set(col.payments.map((p) => p.studentId));
          const paidCount = paidIds.size;
          const totalStudents = students.length;
          const progress = totalStudents > 0 ? (paidCount / totalStudents) * 100 : 0;
          const isPerfect = paidCount === totalStudents && totalStudents > 0;
          const isExpanded = expandedId === col.id;

          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className="rounded-xl border border-border bg-white/[0.02] overflow-hidden"
            >
              {/* Collection Header — clickable */}
              <button
                onClick={() => toggle(col.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      isPerfect
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-violet-500/10 text-violet-400"
                    }`}
                  >
                    {isPerfect ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <ClipboardList className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {col.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {formatRupiah(col.amount)} &middot; {paidCount}/{totalStudents} lunas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isPerfect
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {Math.round(progress)}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Progress bar (always visible) */}
              <div className="px-4 pb-3">
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isPerfect ? "bg-emerald-500" : "bg-violet-500"
                    }`}
                  />
                </div>
              </div>

              {/* Expanded student list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-4 py-3 space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
                      {col.description && (
                        <p className="text-[10px] text-muted-foreground mb-3 italic">
                          {col.description}
                        </p>
                      )}
                      {students.map((student, sIdx) => {
                        const hasPaid = paidIds.has(student.id);
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                              hasPaid
                                ? "bg-emerald-500/5 border border-emerald-500/10"
                                : "bg-white/[0.01] border border-border/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-[10px] text-slate-600 font-mono">
                                {sIdx + 1}
                              </span>
                              <span
                                className={`font-semibold ${
                                  hasPaid ? "text-slate-200" : "text-slate-400"
                                }`}
                              >
                                {student.name}
                              </span>
                            </div>
                            {hasPaid ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                LUNAS
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                                <XCircle className="h-3 w-3" />
                                BELUM
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
