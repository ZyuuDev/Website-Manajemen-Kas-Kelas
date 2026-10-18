"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CircleDashed,
  Clock3,
  Leaf,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import type { PointerEvent } from "react";

interface BalanceCardProps {
  liveBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalDebt: number;
}

const tiles = [
  {
    key: "income" as const,
    label: "Uang masuk",
    sublabel: "Terkumpul semester ini",
    icon: ArrowDownLeft,
    color: "text-emerald-700 dark:text-emerald-300",
    chip: "bg-emerald-300/25 text-emerald-800 dark:text-emerald-200",
    index: "01",
  },
  {
    key: "expense" as const,
    label: "Uang keluar",
    sublabel: "Untuk keperluan bersama",
    icon: ArrowUpRight,
    color: "text-foreground",
    chip: "bg-amber-200/35 text-amber-800 dark:text-amber-200",
    index: "02",
  },
  {
    key: "debt" as const,
    label: "Belum terkumpul",
    sublabel: "Total tunggakan iuran",
    icon: Clock3,
    color: "text-foreground",
    chip: "bg-rose-200/30 text-rose-800 dark:text-rose-200",
    index: "03",
  },
];

export function BalanceCard({
  liveBalance,
  totalIncome,
  totalExpense,
  totalDebt,
}: BalanceCardProps) {
  const values = { income: totalIncome, expense: totalExpense, debt: totalDebt };
  const reduceMotion = useReducedMotion();

  const moveReflection = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const panel = event.currentTarget;
    const bounds = panel.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    panel.style.setProperty("--shine-x", `${x * 100}%`);
    panel.style.setProperty("--shine-y", `${y * 100}%`);
    panel.style.setProperty("--art-x", `${(x - 0.5) * 10}px`);
    panel.style.setProperty("--art-y", `${(y - 0.5) * 8}px`);
  };

  const resetReflection = (event: PointerEvent<HTMLDivElement>) => {
    ["--shine-x", "--shine-y", "--art-x", "--art-y"].forEach((property) => {
      event.currentTarget.style.removeProperty(property);
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:gap-5">
      <div className="wallet-stage" onPointerMove={moveReflection} onPointerLeave={resetReflection}>
        <div className="wallet-orbit" aria-hidden="true" />
        <div className="wallet-art" aria-hidden="true">
          <div className="glass-coin"><Leaf /></div>
          <div className="glass-note glass-note-back" />
          <div className="glass-note glass-note-front">
            <div className="flex items-center justify-between">
              <Wallet className="size-5" />
              <span className="text-[9px] font-bold tracking-[.2em]">SAKU / KELAS</span>
            </div>
            <div className="note-currency">Rp<span>.</span></div>
            <div className="note-lines"><span /><span /><span /></div>
            <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.14em]">
              <span>Milik bersama</span><Banknote className="size-5" />
            </div>
          </div>
          <div className="glass-spark glass-spark-one" />
          <div className="glass-spark glass-spark-two" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-start">
          <div className="flex w-full items-center justify-between gap-3">
            <span className="wallet-label"><span className="size-1.5 rounded-full bg-current" />DOMPET KELAS</span>
            <CircleDashed className="size-5 text-primary/50" aria-hidden="true" />
          </div>
          <div className="wallet-amount">
            <p className="mb-3 text-xs font-medium text-foreground/70">Saldo yang bisa kita pakai</p>
            <p className="balance-amount tabular-nums">{formatRupiah(liveBalance)}</p>
            <p className="mt-3 max-w-58 text-xs leading-relaxed text-muted-foreground">Dari kita. Untuk kita.<br />Buat hal-hal baik berikutnya.</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-7">
            <a href="#buku-kas" className="glass-button wallet-action px-4 text-[11px] font-bold">Buka buku kas<ArrowUpRight className="size-3.5" /></a>
            <a href="#cek-iuran" className="inline-flex min-h-10 items-center gap-1 text-[11px] font-bold text-primary hover:underline">Cek iuranmu<ArrowUpRight className="size-3" /></a>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {tiles.map(({ key, label, sublabel, icon: Icon, color, chip, index }) => (
          <div key={key} className="metric-glass group">
            <div className={`metric-icon ${chip}`}><Icon className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
              <p className={`my-1 break-words text-[clamp(1.25rem,2vw,1.7rem)] font-extrabold leading-tight tracking-[-.04em] tabular-nums ${color}`}>{formatRupiah(values[key])}</p>
              <p className="text-[10px] text-muted-foreground">{sublabel}</p>
            </div>
            <span className="self-start pt-1 text-[9px] font-medium tracking-widest text-muted-foreground/50 sm:hidden lg:block">/{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
