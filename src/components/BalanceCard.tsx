"use client";

import { Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatRupiah } from "@/lib/utils";

interface BalanceCardProps {
  liveBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalDebt: number;
}

const tiles = [
  {
    key: "income" as const,
    label: "Pemasukan",
    sublabel: "Iuran terkumpul semester ini",
    icon: TrendingUp,
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    borderTop: "border-t-2 border-t-emerald-500",
  },
  {
    key: "expense" as const,
    label: "Pengeluaran",
    sublabel: "Untuk keperluan kelas",
    icon: TrendingDown,
    text: "text-orange-600 dark:text-orange-400",
    chip: "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400",
    borderTop: "border-t-2 border-t-orange-500",
  },
  {
    key: "debt" as const,
    label: "Tunggakan",
    sublabel: "Tagihan belum terbayar",
    icon: AlertCircle,
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    borderTop: "border-t-2 border-t-rose-500",
  },
];

export function BalanceCard({
  liveBalance,
  totalIncome,
  totalExpense,
  totalDebt,
}: BalanceCardProps) {
  const values = { income: totalIncome, expense: totalExpense, debt: totalDebt };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Kartu saldo utama (Executive Slate Card) */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="sm:col-span-2 xl:col-span-1"
      >
        <div className="relative h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
          {/* Aksen subtle grid/light */}
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Saldo Kas Real-time
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-indigo-400">
                <Wallet className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-5 break-words text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              {formatRupiah(liveBalance)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Tersinkronisasi dengan aplikasi bendahara
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiga tile metrik */}
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <motion.div key={t.key} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <div className={`relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs ${t.borderTop}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.chip}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className={`mt-4 break-words text-2xl font-extrabold tracking-tight sm:text-[26px] ${t.text}`}>
                {formatRupiah(values[t.key])}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {t.sublabel}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
