"use client";

import { Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/mock-data";
import { motion } from "framer-motion";

interface BalanceCardProps {
  liveBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalDebt: number;
}

const stat = [
  {
    key: "income" as const,
    label: "Total Pemasukan",
    sublabel: "Iuran terkumpul semester ini",
    icon: TrendingUp,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/10",
  },
  {
    key: "expense" as const,
    label: "Total Pengeluaran",
    sublabel: "Untuk keperluan kelas",
    icon: TrendingDown,
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/10",
  },
  {
    key: "debt" as const,
    label: "Total Tunggakan",
    sublabel: "Tagihan belum terbayar",
    icon: AlertCircle,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/10",
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
      {/* Main Balance Card */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="sm:col-span-2 xl:col-span-1"
      >
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-emerald-950/40 via-card to-card p-6 shadow-xl shadow-black/20 h-full">
          {/* Glow decoration */}
          <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-20 w-40 rounded-full bg-teal-500/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Saldo Kas Kelas
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Wallet className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Saldo Saat Ini (Live)</div>
              <p className="bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                {formatRupiah(liveBalance)}
              </p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Diperbarui real-time dari aplikasi bendahara
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      {stat.map((s) => {
        const Icon = s.icon;
        const value = values[s.key];
        return (
          <motion.div
            key={s.key}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10 h-full backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bgClass} ${s.colorClass}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className={`mt-4 text-2xl font-extrabold tracking-tight ${s.colorClass} sm:text-3xl`}>
                {formatRupiah(value)}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground/60">{s.sublabel}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
