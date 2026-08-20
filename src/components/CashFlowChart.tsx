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

  const incomeEntry = payload.find((p: any) => p.dataKey === "income");
  const expenseEntry = payload.find((p: any) => p.dataKey === "expense");
  const incomeVal = incomeEntry?.value ?? 0;
  const expenseVal = expenseEntry?.value ?? 0;
  const netWeek = incomeVal - expenseVal;

  return (
    <div className="min-w-[190px] rounded-2xl border-2 border-border bg-popover/95 p-3.5 text-xs shadow-xl backdrop-blur-sm">
      <div className="mb-2.5 flex items-center justify-between border-b-2 border-border pb-2">
        <span className="font-extrabold text-popover-foreground">{label}</span>
        {netWeek !== 0 && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
              netWeek > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
            }`}
          >
            {netWeek > 0 ? `+${formatRupiah(netWeek)}` : `-${formatRupiah(Math.abs(netWeek))}`}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {payload.map((entry: any) => {
          const meta = seriesMeta[entry.dataKey];
          if (!meta) return null;
          const isBalance = entry.dataKey === "balance";

          return (
            <div
              key={entry.dataKey}
              className={`flex items-center justify-between gap-4 ${
                isBalance ? "border-t border-border/60 pt-1.5 font-bold" : ""
              }`}
            >
              <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.colorVar }}
                />
                {meta.label}
              </span>
              <span
                className={`font-mono font-bold ${
                  isBalance ? "text-primary dark:text-indigo-400" : "text-popover-foreground"
                }`}
              >
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
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
      {sorted.map((entry: any) => {
        const meta = seriesMeta[entry.dataKey ?? entry.value];
        return (
          <span
            key={entry.value}
            className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: meta?.colorVar ?? entry.color }}
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
  if (value === 0) return "0";
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (Math.abs(value) >= 1_000)
    return `${Math.round(value / 1_000)}rb`;
  return `${value}`;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const hasData = data && data.length > 0;
  const totalIncome = (data || []).reduce((sum, w) => sum + (w.income || 0), 0);
  const totalExpense = (data || []).reduce((sum, w) => sum + (w.expense || 0), 0);

  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Arus Kas Mingguan</h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Uang masuk vs keluar per minggu, plus garis saldo berjalan
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        {hasData && (totalIncome > 0 || totalExpense > 0) && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Masuk:</span>
              <span className="font-mono text-foreground">{shortRupiah(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Keluar:</span>
              <span className="font-mono text-foreground">{shortRupiah(totalExpense)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="min-h-[260px] flex-1 sm:min-h-[300px]">
        {!hasData ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-muted-foreground">Belum Ada Data Arus Kas</p>
            <p className="text-[10px] font-medium text-muted-foreground/70">
              Grafik akan terbentuk otomatis seiring berjalannya transaksi kas mingguan
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={260}>
            <ComposedChart
              accessibilityLayer={false}
              data={data}
              barGap={3}
              barCategoryGap="22%"
              margin={{ top: 20, right: 20, left: 8, bottom: 6 }}
            >
              <defs>
                <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-income)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-income)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-expense)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-expense)" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickMargin={8}
                padding={{ left: 16, right: 16 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tickFormatter={shortRupiah}
                domain={[
                  0,
                  (dataMax: number) =>
                    dataMax > 0 ? Math.ceil((dataMax * 1.18) / 50000) * 50000 : 100000,
                ]}
                allowDecimals={false}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Legend content={<LegendContent />} />
              <Bar
                dataKey="income"
                name="Masuk"
                fill="url(#incomeBarGrad)"
                radius={[5, 5, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              />
              <Bar
                dataKey="expense"
                name="Keluar"
                fill="url(#expenseBarGrad)"
                radius={[5, 5, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="balance"
                name="Saldo"
                stroke="var(--chart-balance)"
                strokeWidth={2.5}
                dot={{
                  r: 4.5,
                  fill: "var(--card)",
                  stroke: "var(--chart-balance)",
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 6.5,
                  fill: "var(--chart-balance)",
                  stroke: "var(--card)",
                  strokeWidth: 2.5,
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
