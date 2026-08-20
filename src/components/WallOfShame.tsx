"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Sparkles, Trophy, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";

interface WallOfShameProps {
  students: StudentStats[];
  weeklyAmount: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function WallOfShame({ students }: WallOfShameProps) {
  const [activeTab, setActiveTab] = useState<"debtors" | "fame">("fame");

  const debtors = [...students]
    .filter((s) => s.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  const starStudents = [...students]
    .filter((s) => s.isLunas)
    .sort((a, b) => b.totalPaid - a.totalPaid || a.name.localeCompare(b.name));

  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 border-b border-border/70 bg-card">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                activeTab === "fame"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              }`}
            >
              {activeTab === "fame" ? (
                <Trophy className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              ) : (
                <AlertTriangle className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-foreground">
                {activeTab === "fame" ? "Wall of Fame" : "Papan Tunggakan"}
              </h3>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {activeTab === "fame"
                  ? "Siswa teladan lunas terdepan"
                  : "Daftar siswa belum lunas"}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
              activeTab === "fame"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
            }`}
          >
            {activeTab === "fame" ? `${starStudents.length} Lunas` : `${debtors.length} Siswa`}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted/70 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("fame")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-2 text-xs transition-all ${
              activeTab === "fame"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Teladan ({starStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("debtors")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-2 text-xs transition-all ${
              activeTab === "debtors"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Tunggakan ({debtors.length})</span>
          </button>
        </div>
      </div>

      {/* List content (Clean scroll tanpa kepotong) */}
      <div className="scrollbar-none min-h-70 flex-1 overflow-y-auto p-4 sm:p-5 pt-3 sm:pt-4 space-y-2 max-h-110">
        <AnimatePresence mode="wait">
          {activeTab === "fame" ? (
            <motion.div
              key="fame-list"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {starStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground">
                      Belum Ada Siswa Lunas
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Ayo jadi yang pertama melunasi kas kelas semester ini!
                    </p>
                  </div>
                </div>
              ) : (
                starStudents.map((star, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <div
                      key={star.id}
                      className={`flex items-center gap-2.5 sm:gap-3 rounded-2xl border p-2.5 sm:p-3 transition-colors ${
                        isTop1
                          ? "border-amber-300 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30"
                          : isTop2
                          ? "border-slate-300 bg-slate-50/70 dark:border-slate-700/60 dark:bg-slate-900/30"
                          : isTop3
                          ? "border-orange-300 bg-orange-50/70 dark:border-orange-800/60 dark:bg-orange-950/30"
                          : "border-border bg-background"
                      }`}
                    >
                      {/* Rank / Medal badge */}
                      <span
                        className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                          isTop1
                            ? "bg-amber-500 text-white shadow-xs"
                            : isTop2
                            ? "bg-slate-400 text-white"
                            : isTop3
                            ? "bg-amber-700 text-white"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : index + 1}
                      </span>

                      {/* Initials avatar */}
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[10px] sm:text-[11px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                        {initials(star.name)}
                      </span>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-bold text-foreground">{star.name}</p>
                          {isTop1 && (
                            <span className="shrink-0 rounded-md bg-amber-500/15 px-1 py-0.2 text-[9px] font-extrabold text-amber-600 dark:text-amber-400">
                              Top 1
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          ✓ Lunas Semester Ini
                        </p>
                      </div>

                      {/* Amount */}
                      <span className="shrink-0 font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(star.totalPaid)}
                      </span>
                    </div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="debtors-list"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {debtors.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-foreground">
                      <span>Keren, semua lunas!</span>
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Tidak ada tunggakan kas minggu ini.
                    </p>
                  </div>
                </div>
              ) : (
                debtors.map((debtor, index) => (
                  <div
                    key={debtor.id}
                    className={`flex items-center gap-2.5 sm:gap-3 rounded-2xl border p-2.5 sm:p-3 transition-colors ${
                      index === 0
                        ? "border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30"
                        : "border-border bg-background"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                        index === 0
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-[10px] sm:text-[11px] font-extrabold uppercase text-accent-foreground">
                      {initials(debtor.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">{debtor.name}</p>
                      <p className="truncate text-[10px] font-medium text-muted-foreground">
                        {debtor.debtWeeks} minggu belum bayar
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      {formatRupiah(debtor.debt)}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
