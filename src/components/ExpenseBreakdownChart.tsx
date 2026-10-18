"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { ExpenseRecord } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";

const categoryColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"];
interface CategoryPayload { name: string; value: number; payload: { fill?: string }; }

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: CategoryPayload[] }) {
  if (!active || !payload?.length) return null;
  return <div className="glass-popover px-4 py-3 text-xs"><p className="text-muted-foreground">{payload[0].name}</p><p className="mt-1 font-semibold tabular-nums">{formatRupiah(payload[0].value)}</p></div>;
}

export function ExpenseBreakdownChart({ expenses }: { expenses: ExpenseRecord[] }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories: Record<string, number> = {};
  for (const expense of expenses) {
    const category = expense.category?.trim() || "Lainnya";
    categories[category] = (categories[category] || 0) + expense.amount;
  }
  const data = Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <section className="glass-panel glass-section flex h-full min-w-0 flex-col">
      <SectionHeading eyebrow="Penggunaan dana" title="Alokasi pengeluaran" description="Rincian pemakaian kas semester ini." />
      {data.length === 0 ? (
        <div className="panel-empty flex-1"><strong>Belum ada pengeluaran.</strong><p className="mt-1 text-[11px]">Kategori akan muncul setelah transaksi dicatat.</p></div>
      ) : (
        <>
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%" minHeight={224} initialDimension={{ width: 240, height: 224 }}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={76} outerRadius={92} paddingAngle={4} cornerRadius={4} dataKey="value" isAnimationActive={false}>
                  {data.map((item, index) => <Cell key={item.name} fill={categoryColors[index % categoryColors.length]} stroke="none" />)}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground">Total keluar</span>
              <span className="mt-2 max-w-36 break-words text-xl font-medium tracking-tight tabular-nums">{formatRupiah(totalExpense)}</span>
            </div>
          </div>
          <div className="mt-3">
            {data.map((item, index) => {
              const percentage = Math.round(item.value / Math.max(1, totalExpense) * 100);
              const color = categoryColors[index % categoryColors.length];
              return <div key={item.name} className="category-row"><div className="min-w-0"><p className="font-medium">{item.name}</p><div className="category-bar"><div className="h-full rounded-full" style={{ width: `${percentage}%`, background: color }} /></div></div><div className="text-right tabular-nums"><p className="font-medium">{formatRupiah(item.value)}</p><p className="mt-1 text-[9px] text-muted-foreground">{percentage}%</p></div></div>;
            })}
          </div>
        </>
      )}
    </section>
  );
}
