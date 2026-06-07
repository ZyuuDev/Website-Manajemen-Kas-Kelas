"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatRupiah } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";

interface CashFlowData {
  name: string;
  income: number;
  expense: number;
  balance: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl text-xs min-w-[180px]">
        <p className="mb-3 font-bold text-slate-200 border-b border-slate-800 pb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Masuk
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formatRupiah(payload[0]?.value ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
              Keluar
            </span>
            <span className="font-mono font-bold text-rose-400">
              {formatRupiah(payload[1]?.value ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-2 mt-1">
            <span className="flex items-center gap-1.5 text-teal-400">
              <span className="inline-block h-2 w-2 rounded-full bg-teal-400" />
              Saldo
            </span>
            <span className="font-mono font-bold text-teal-300">
              {formatRupiah(payload[2]?.value ?? 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl backdrop-blur-sm h-full">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Grafik Aliran Kas Kelas</h3>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground pl-10">
            Perbandingan mingguan uang masuk vs keluar
          </p>
        </div>
        {/* Legend chips */}
        <div className="hidden sm:flex flex-col gap-1.5 shrink-0 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-emerald-400" />Masuk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-rose-400" />Keluar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-teal-400" />Saldo
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#475569"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#334155", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area name="Uang Masuk"     type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#gIncome)"  fillOpacity={1} dot={false} activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} />
            <Area name="Uang Keluar"    type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExpense)" fillOpacity={1} dot={false} activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} />
            <Area name="Saldo Kumulatif" type="monotone" dataKey="balance" stroke="#2dd4bf" strokeWidth={1.5} strokeDasharray="5 4" fill="url(#gBalance)" fillOpacity={1} dot={false} activeDot={{ r: 4, fill: "#2dd4bf", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
