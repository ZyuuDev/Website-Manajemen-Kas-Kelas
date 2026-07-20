"use client";

import { useState } from "react";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ImageOff,
  X,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-xs">
        {/* Header */}
        <div className="flex items-start gap-2.5 p-5 pb-3 sm:p-6 sm:pb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Receipt className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Aktivitas Terakhir</h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Iuran masuk & pengeluaran kelas
            </p>
          </div>
        </div>

        {/* Daftar */}
        <div
          className="scrollbar-none min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6"
          style={{ maxHeight: 420 }}
        >
          {allActivities.length === 0 ? (
            <p className="py-10 text-center text-xs font-medium text-muted-foreground">
              Belum ada transaksi semester ini.
            </p>
          ) : (
            allActivities.map((item) => {
              const isIncome = item.type === "INCOME";
              const clickable = !isIncome && !!item.receiptUrl;
              return (
                <button
                  key={item.id}
                  disabled={!clickable}
                  onClick={() => clickable && setSelectedReceipt(item)}
                  className={`flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all ${
                    clickable ? "cursor-pointer hover:border-primary/50" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.title}</p>
                    <p className="flex items-center gap-1 truncate text-[10px] font-medium text-muted-foreground">
                      <span>{item.subtitle} · {formatDateShort(item.date)}</span>
                      {clickable && (
                        <span className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-semibold ml-1">
                          · <Camera className="h-3 w-3" /> lihat nota
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-extrabold ${
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatRupiah(item.amount)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Modal nota */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                aria-label="Tutup"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="pr-10 text-sm font-extrabold">{selectedReceipt.title}</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                {selectedReceipt.category} · {formatDateShort(selectedReceipt.date)} ·{" "}
                <span className="font-extrabold text-orange-600 dark:text-orange-400">
                  {formatRupiah(selectedReceipt.amount)}
                </span>
              </p>

              <div className="mt-4 flex max-h-[60vh] min-h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                {selectedReceipt.receiptUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedReceipt.receiptUrl}
                    alt={`Nota: ${selectedReceipt.title}`}
                    className="max-h-[60vh] w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-xs font-medium">Nota tidak tersedia</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
