"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieIcon, ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { ExpenseRecord } from "@/lib/types";

interface ExpenseBreakdownChartProps {
  expenses: ExpenseRecord[];
}

const CATEGORY_COLORS = [
  "#4f46e5", // Indigo
  "#f97316", // Orange
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="min-w-[160px] rounded-2xl border-2 border-border bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 font-bold text-popover-foreground">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.color }}
        />
        <span className="truncate">{data.name}</span>
      </div>
      <p className="mt-1.5 font-mono text-sm font-extrabold text-foreground">
        {formatRupiah(data.value)}
      </p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
      {payload.map((entry: any, index: number) => (
        <span
          key={`item-${index}`}
          className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

export function ExpenseBreakdownChart({ expenses }: ExpenseBreakdownChartProps) {
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap: Record<string, number> = {};
  for (const exp of expenses) {
    const cat = exp.category?.trim() || "Lainnya";
    categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
  }

  const chartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
            <PieIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              Alokasi Pengeluaran
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Distribusi penggunaan kas per kategori
            </p>
          </div>
        </div>

        {totalExpense > 0 && (
          <span className="hidden sm:inline-flex rounded-xl border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] font-bold font-mono text-muted-foreground">
            Total: {formatRupiah(totalExpense)}
          </span>
        )}
      </div>

      {/* Body */}
      {chartData.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-muted-foreground">
            Belum Ada Pengeluaran
          </p>
          <p className="text-[10px] font-medium text-muted-foreground/70">
            Seluruh saldo kas masih utuh semester ini
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between">
          <div className="min-h-[200px] flex-1 sm:min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart accessibilityLayer={false}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      stroke="var(--card)"
                      strokeWidth={2.5}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top category breakdown list */}
          <div className="mt-3 divide-y divide-border border-t border-border pt-3">
            {chartData.slice(0, 3).map((item, idx) => {
              const pct = Math.round((item.value / Math.max(1, totalExpense)) * 100);
              return (
                <div key={item.name} className="flex items-center justify-between py-1.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate font-semibold text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-foreground">{formatRupiah(item.value)}</span>
                    <span className="text-muted-foreground font-semibold">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
