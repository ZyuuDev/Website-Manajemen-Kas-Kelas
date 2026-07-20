"use client";

import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
  const debtors = [...students]
    .filter((s) => s.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3 sm:p-6 sm:pb-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Papan Tunggakan</h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Urut dari yang paling besar
            </p>
          </div>
        </div>
        {debtors.length > 0 && (
          <span className="shrink-0 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
            {debtors.length} siswa
          </span>
        )}
      </div>

      {/* Isi */}
      <div className="scrollbar-none min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6" style={{ maxHeight: 380 }}>
        {debtors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-foreground">
                <span>Keren, semua lunas!</span>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Tidak ada tunggakan minggu ini.
              </p>
            </div>
          </div>
        ) : (
          debtors.map((debtor, index) => (
            <motion.div
              key={debtor.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                index === 0
                  ? "border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30"
                  : "border-border bg-background"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  index === 0
                    ? "bg-rose-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-extrabold uppercase text-accent-foreground">
                {initials(debtor.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{debtor.name}</p>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {debtor.debtWeeks} minggu belum bayar
                </p>
              </div>
              <span className="shrink-0 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                {formatRupiah(debtor.debt)}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
