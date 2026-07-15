"use client";

import { AlertTriangle, PartyPopper } from "lucide-react";
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
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3 sm:p-6 sm:pb-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger-soft text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Papan Tunggakan</h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Urut dari yang paling besar
            </p>
          </div>
        </div>
        {debtors.length > 0 && (
          <span className="shrink-0 rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-extrabold text-destructive">
            {debtors.length} siswa
          </span>
        )}
      </div>

      {/* Isi */}
      <div className="scrollbar-none min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6" style={{ maxHeight: 380 }}>
        {debtors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-success-soft text-success">
              <PartyPopper className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Keren, semua lunas! 🎉</p>
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
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${
                index === 0
                  ? "border-destructive/40 bg-danger-soft"
                  : "border-border bg-background"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  index === 0
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-[11px] font-extrabold uppercase text-accent-foreground">
                {initials(debtor.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{debtor.name}</p>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {debtor.debtWeeks} minggu belum bayar
                </p>
              </div>
              <span className="shrink-0 text-xs font-extrabold text-destructive">
                {formatRupiah(debtor.debt)}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
