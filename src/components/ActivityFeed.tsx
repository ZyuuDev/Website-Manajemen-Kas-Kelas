"use client";

import { useState } from "react";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Calendar,
  Info,
  X,
} from "lucide-react";
import { formatRupiah, Student, ExpenseRecord } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  category?: string;
  receiptUrl?: string;
  description?: string;
}

interface ActivityFeedProps {
  students: Student[];
  expenses: ExpenseRecord[];
}

export function ActivityFeed({ students, expenses }: ActivityFeedProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ActivityItem | null>(null);

  const incomeActivities: ActivityItem[] = students.flatMap((std) =>
    std.payments.map((pay) => ({
      id: pay.id,
      type: "INCOME" as const,
      title: std.name,
      subtitle: "Pembayaran iuran kas",
      amount: pay.amount,
      date: pay.date,
    }))
  );

  const expenseActivities: ActivityItem[] = expenses.map((exp) => ({
    id: exp.id,
    type: "EXPENSE" as const,
    title: exp.title,
    subtitle: exp.description,
    amount: exp.amount,
    date: exp.date,
    category: exp.category,
    receiptUrl: exp.receiptUrl,
    description: exp.description,
  }));

  const allActivities = [...incomeActivities, ...expenseActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-xl backdrop-blur-sm">
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Aktivitas Terakhir</h3>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground pl-10">
            Pemasukan iuran & pengeluaran kelas
          </p>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 scrollbar-none min-h-0"
          style={{ maxHeight: 380 }}
        >
          {allActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">Belum ada aktivitas tercatat.</p>
            </div>
          ) : (
            allActivities.slice(0, 20).map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="flex items-center justify-between rounded-xl border border-border bg-white/[0.01] px-3 py-2.5 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Icon + text */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      activity.type === "INCOME"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {activity.type === "INCOME" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{activity.subtitle}</p>
                  </div>
                </div>

                {/* Amount + meta */}
                <div className="ml-3 shrink-0 text-right">
                  <p
                    className={`font-mono text-xs font-bold ${
                      activity.type === "INCOME" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {activity.type === "INCOME" ? "+" : "-"}
                    {formatRupiah(activity.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(activity.date)}
                    </span>
                    {activity.type === "EXPENSE" && (
                      <button
                        onClick={() => setSelectedReceipt(activity)}
                        className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Struk
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Bukti Nota / Struk</p>
                  <p className="text-[10px] text-muted-foreground">Detail pengeluaran kas kelas</p>
                </div>
              </div>

              {/* Details */}
              <div className="rounded-xl border border-border bg-[#050810]/60 p-4 space-y-2.5 text-xs mb-4">
                {[
                  { label: "Deskripsi", value: selectedReceipt.title },
                  { label: "Kategori", value: selectedReceipt.category ?? "-" },
                  { label: "Tanggal", value: formatDate(selectedReceipt.date) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold text-slate-200">{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-2.5 mt-1">
                  <span className="text-muted-foreground">Total Nominal</span>
                  <span className="font-mono font-bold text-destructive text-sm">
                    {formatRupiah(selectedReceipt.amount)}
                  </span>
                </div>
              </div>

              {/* Receipt Image or Simulated Receipt */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-[#050810] h-52 flex items-center justify-center p-2">
                {selectedReceipt.receiptUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedReceipt.receiptUrl}
                    alt="Nota Belanja"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10 pointer-events-none" />
                    <div className="bg-white text-slate-900 p-4 w-44 rounded shadow-xl text-left font-mono text-[8px] -rotate-1 relative z-0">
                      <p className="font-bold text-center border-b border-dashed border-slate-300 pb-1 text-[9px]">
                        KAS KELAS
                      </p>
                      <p className="text-slate-400 text-center text-[7px] mb-2">BUKTI PENGELUARAN SAH</p>
                      <div className="space-y-0.5">
                        <p className="flex justify-between gap-1">
                          <span>ITEM:</span>
                          <span className="truncate max-w-[70px] text-right">{selectedReceipt.title}</span>
                        </p>
                        <p className="flex justify-between gap-1">
                          <span>TGL:</span>
                          <span>{selectedReceipt.date}</span>
                        </p>
                        <p className="flex justify-between gap-1">
                          <span>KAT:</span>
                          <span>{selectedReceipt.category}</span>
                        </p>
                      </div>
                      <div className="border-t border-dashed border-slate-300 pt-1 mt-2">
                        <p className="flex justify-between font-bold text-[9px]">
                          <span>TOTAL:</span>
                          <span>{formatRupiah(selectedReceipt.amount)}</span>
                        </p>
                        <p className="text-[6px] text-slate-400 text-center mt-1">TERIMA KASIH · BENDAHARA</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-4 text-[10px] text-muted-foreground bg-gradient-to-t from-[#050810] via-[#050810]/95 to-transparent pt-4 pb-1">
                  <Info className="h-3 w-3 text-primary shrink-0" />
                  <span>
                    {selectedReceipt.receiptUrl ? "Nota fisik diunggah oleh bendahara" : "Struk diarsipkan oleh bendahara kelas"}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
