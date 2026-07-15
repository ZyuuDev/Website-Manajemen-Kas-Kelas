"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { CashFlowWeek } from "@/lib/types";

interface CashFlowChartProps {
  data: CashFlowWeek[];
}

const seriesMeta: Record<string, { label: string; colorVar: string }> = {
  income: { label: "Masuk", colorVar: "var(--chart-income)" },
  expense: { label: "Keluar", colorVar: "var(--chart-expense)" },
  balance: { label: "Saldo", colorVar: "var(--chart-balance)" },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="min-w-[180px] rounded-2xl border-2 border-border bg-popover p-3.5 text-xs shadow-xl">
      <p className="mb-2.5 border-b-2 border-border pb-2 font-extrabold text-popover-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => {
          const meta = seriesMeta[entry.dataKey];
          if (!meta) return null;
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.colorVar }}
                />
                {meta.label}
              </span>
              <span className="font-mono font-bold text-popover-foreground">
                {formatRupiah(entry.value ?? 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const legendOrder = ["income", "expense", "balance"];

function LegendContent({ payload }: any) {
  if (!payload) return null;
  const sorted = [...payload].sort(
    (a: any, b: any) =>
      legendOrder.indexOf(a.dataKey ?? a.value) - legendOrder.indexOf(b.dataKey ?? b.value)
  );
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      {sorted.map((entry: any) => {
        const meta = seriesMeta[entry.dataKey ?? entry.value];
        return (
          <span
            key={entry.value}
            className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {meta?.label ?? entry.value}
          </span>
        );
      })}
    </div>
  );
}

// Sumbu Y disingkat: 1.500.000 → 1,5jt · 50.000 → 50rb
function shortRupiah(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (Math.abs(value) >= 1_000)
    return `${Math.round(value / 1_000)}rb`;
  return `${value}`;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-start gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold">Arus Kas Mingguan</h3>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Uang masuk vs keluar per minggu, plus garis saldo berjalan
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="min-h-[260px] flex-1 sm:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <ComposedChart data={data} barGap={2} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={shortRupiah}
              width={44}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
            <Legend content={<LegendContent />} />
            <Bar
              dataKey="income"
              fill="var(--chart-income)"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              isAnimationActive={false}
            />
            <Bar
              dataKey="expense"
              fill="var(--chart-expense)"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--chart-balance)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
