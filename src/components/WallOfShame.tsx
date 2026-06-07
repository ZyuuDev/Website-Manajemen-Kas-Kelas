"use client";

import { AlertTriangle, ShieldAlert, AlertCircle, TrendingDown } from "lucide-react";
import { formatRupiah } from "@/lib/mock-data";
import { motion } from "framer-motion";

interface StudentStats {
  id: string;
  name: string;
  nis: string;
  totalPaid: number;
  debt: number;
  debtWeeks: number;
  isLunas: boolean;
}

interface WallOfShameProps {
  students: StudentStats[];
  weeklyAmount: number;
}

export function WallOfShame({ students }: WallOfShameProps) {
  const debtors = students
    .filter((s) => s.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-gradient-to-b from-card to-rose-950/5 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Wall of Debt</h3>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground pl-10">
            Daftar tunggakan terbesar semester ini
          </p>
        </div>
        {debtors.length > 0 && (
          <span className="shrink-0 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive">
            {debtors.length} siswa
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 scrollbar-none min-h-0" style={{ maxHeight: 380 }}>
        {debtors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="h-7 w-7 rotate-180" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Luar Biasa! 🎉</p>
              <p className="mt-1 text-xs text-slate-500">
                Tidak ada siswa yang menunggak.<br />Semua lunas!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Warning Banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 text-xs text-rose-400/80">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Segera hubungi bendahara kelas untuk melakukan pelunasan tunggakan.</span>
            </div>

            {/* Debtors List */}
            <div className="space-y-2 mt-3">
              {debtors.map((debtor, index) => {
                const isTop = index < 3;
                const rankColors = ["text-rose-400", "text-orange-400", "text-amber-400"];
                return (
                  <motion.div
                    key={debtor.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      {isTop ? (
                        <ShieldAlert className={`h-4 w-4 shrink-0 ${rankColors[index]}`} />
                      ) : (
                        <span className="w-4 text-center text-[10px] font-bold text-slate-600">
                          {index + 1}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-200">
                          {debtor.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600">
                          NIS: {debtor.nis}
                        </p>
                      </div>
                    </div>
                    {/* Right */}
                    <div className="shrink-0 text-right ml-3">
                      <p className="font-mono text-xs font-bold text-rose-400">
                        {formatRupiah(debtor.debt)}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {debtor.debtWeeks} minggu
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
