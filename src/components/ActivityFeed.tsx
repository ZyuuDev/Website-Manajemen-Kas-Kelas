"use client";

import { Fragment, useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Camera } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { GlassDialog } from "@/components/GlassDialog";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import type { StudentStats, ExpenseRecord, MiscIncomeRecord } from "@/lib/types";

interface ActivityItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  category?: string;
  receiptUrl?: string;
}

interface ActivityFeedProps {
  students: StudentStats[];
  expenses: ExpenseRecord[];
  miscIncomes?: MiscIncomeRecord[];
}

export function ActivityFeed({ students, expenses, miscIncomes }: ActivityFeedProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ActivityItem | null>(null);

  const incomeActivities: ActivityItem[] = students.flatMap((std) =>
    std.payments.map((pay) => ({
      id: pay.id,
      type: "INCOME" as const,
      title: std.name,
      subtitle: "Bayar iuran kas",
      amount: pay.amount,
      date: pay.date,
    }))
  );

  const miscActivities: ActivityItem[] = (miscIncomes || []).map((misc) => ({
    id: misc.id,
    type: "INCOME" as const,
    title: "Pemasukan Umum",
    subtitle: misc.description,
    amount: misc.amount,
    date: misc.date,
  }));

  const expenseActivities: ActivityItem[] = expenses.map((exp) => ({
    id: exp.id,
    type: "EXPENSE" as const,
    title: exp.title,
    subtitle: exp.category,
    amount: exp.amount,
    date: exp.date,
    category: exp.category,
    receiptUrl: exp.receiptUrl,
  }));

  const allActivities = [...incomeActivities, ...miscActivities, ...expenseActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <section className="glass-panel glass-section flex h-full min-w-0 flex-col">
        <SectionHeading eyebrow="Riwayat transaksi" title="Aktivitas terbaru" description="Pemasukan dan pengeluaran, sesuai catatan bendahara." />
        <div className="max-h-105 overflow-y-auto pr-1">
          {allActivities.length === 0 ? <div className="panel-empty"><strong>Belum ada transaksi.</strong><p className="mt-1 text-[11px]">Transaksi yang dicatat akan muncul di sini.</p></div> : allActivities.map((item, index) => {
            const isIncome = item.type === "INCOME";
            const clickable = !isIncome && !!item.receiptUrl;
            const date = formatDateShort(item.date);
            const showDate = index === 0 || date !== formatDateShort(allActivities[index - 1].date);
            const content = <>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isIncome ? "status-paid" : "status-expense"}`}>{isIncome ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}</span>
              <div className="min-w-0 flex-1"><p className="line-clamp-2 text-[11px] font-medium leading-relaxed">{item.title}</p><p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{item.subtitle}{clickable && <span className="ml-2 inline-flex items-center gap-1 text-primary"><Camera className="size-2.5" />Nota</span>}</p></div>
              <span className={`shrink-0 text-[11px] font-medium tabular-nums ${isIncome ? "text-primary" : "text-foreground"}`}>{isIncome ? "+" : "−"}{formatRupiah(item.amount)}</span>
            </>;
            return <Fragment key={item.id}>{showDate && <p className="activity-date">{date}</p>}{clickable ? <button type="button" className="activity-row" onClick={() => setSelectedReceipt(item)}>{content}</button> : <div className="activity-row">{content}</div>}</Fragment>;
          })}
        </div>
      </section>
      <GlassDialog open={!!selectedReceipt} onOpenChange={(open) => { if (!open) setSelectedReceipt(null); }}
        eyebrow="Bukti pengeluaran" title={selectedReceipt?.title || "Nota pengeluaran"}
        description={selectedReceipt ? `${selectedReceipt.category} · ${formatDateShort(selectedReceipt.date)}` : undefined}>
        {selectedReceipt && <>
          <p className="text-2xl font-medium tracking-tight tabular-nums">{formatRupiah(selectedReceipt.amount)}</p>
          <div className="section-surface mt-2 flex min-h-48 items-center justify-center overflow-hidden p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedReceipt.receiptUrl} alt={`Nota: ${selectedReceipt.title}`} className="max-h-[60vh] w-full rounded-xl object-contain" />
          </div>
        </>}
      </GlassDialog>
    </>
  );
}
