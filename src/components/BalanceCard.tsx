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
    text: "text-chart-income",
    chip: "bg-chart-income/12 text-chart-income",
    bar: "bg-chart-income",
  },
  {
    key: "expense" as const,
    label: "Pengeluaran",
    sublabel: "Untuk keperluan kelas",
    icon: TrendingDown,
    text: "text-chart-expense",
    chip: "bg-chart-expense/12 text-chart-expense",
    bar: "bg-chart-expense",
  },
  {
    key: "debt" as const,
    label: "Tunggakan",
    sublabel: "Tagihan belum terbayar",
    icon: AlertCircle,
    text: "text-destructive",
    chip: "bg-danger-soft text-destructive",
    bar: "bg-destructive",
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
      {/* Kartu saldo utama */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="sm:col-span-2 xl:col-span-1"
      >
        <div className="relative h-full overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-violet-500 to-fuchsia-500 p-6 shadow-xl shadow-violet-500/25">
          {/* Dekorasi lingkaran */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest">
                Saldo Kas
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-5 break-words text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatRupiah(liveBalance)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/85">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live · langsung dari catatan bendahara
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiga tile metrik */}
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <motion.div key={t.key} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="relative h-full overflow-hidden rounded-3xl border-2 border-border bg-card p-6">
              <span className={`absolute inset-x-0 top-0 h-1.5 ${t.bar}`} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {t.label}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${t.chip}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className={`mt-4 break-words text-2xl font-extrabold tracking-tight sm:text-[26px] ${t.text}`}>
                {formatRupiah(values[t.key])}
              </p>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                {t.sublabel}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
