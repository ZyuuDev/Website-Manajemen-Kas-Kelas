"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ClipboardList,
  History,
  MessageCircle,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, formatDateLong } from "@/lib/utils";
import type { StudentStats, SpecialCollectionInfo } from "@/lib/types";

interface StudentSearchProps {
  students: StudentStats[];
  elapsedWeeks: number;
  weeklyAmount: number;
  allCollections?: SpecialCollectionInfo[];
  classNameText?: string;
}

export function StudentSearch({
  students,
  elapsedWeeks,
  weeklyAmount,
  allCollections = [],
  classNameText = "Kelas",
}: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentStats | null>(null);

  const filteredStudents = searchQuery.trim()
    ? students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (student: StudentStats) => {
    setSelectedStudent(student);
    setSearchQuery("");
  };

  const expectedAmount = elapsedWeeks * weeklyAmount;
  const progressPct = selectedStudent
    ? Math.min(100, (selectedStudent.totalPaid / Math.max(1, expectedAmount)) * 100)
    : 0;

  const collectionStatus = selectedStudent
    ? allCollections.map((col) => ({
        id: col.id,
        name: col.name,
        amount: col.amount,
        hasPaid: col.paidIds.includes(selectedStudent.id),
      }))
    : [];

  const handleWhatsAppConfirm = (student: StudentStats) => {
    const isLunas = student.isLunas;
    const unpaidCollections = collectionStatus.filter((c) => !c.hasPaid);
    const collectionText =
      unpaidCollections.length > 0
        ? `\n• Iuran Khusus Belum: ${unpaidCollections.map((c) => `${c.name} (${formatRupiah(c.amount)})`).join(", ")}`
        : "";

    const message = isLunas
      ? `Halo Bendahara ${classNameText},\nSaya *${student.name}* (NIS: ${student.nis || "-"}).\nAlhamdulillah status kas saya sudah *Lunas Penuh* (${formatRupiah(student.totalPaid)}).\nTerima kasih!`
      : `Halo Bendahara ${classNameText},\nSaya *${student.name}* (NIS: ${student.nis || "-"}).\nSaya ingin konfirmasi pembayaran uang kas:\n• Status: Nunggak ${student.debtWeeks} minggu\n• Nominal Kas: ${formatRupiah(student.debt)}${collectionText}\n\nBerikut saya lampirkan bukti pembayaran. Mohon dicek dan dicatat ya. Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="mb-4 flex items-start gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-foreground">Cek Status Kas Kamu</h3>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Ketik namamu, lihat status lunas, riwayat & konfirmasi ke bendahara
          </p>
        </div>
      </div>

      {/* Input pencarian */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          id="student-search-input"
          type="text"
          placeholder="Ketik nama kamu di sini…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-10 text-sm font-semibold outline-none transition-all placeholder:font-medium placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Hapus pencarian"
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown hasil */}
        <AnimatePresence>
          {filteredStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute inset-x-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 border-border bg-popover p-1.5 shadow-xl"
            >
              {filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="truncate">{s.name}</span>
                  {s.isLunas ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold">
                      Lunas
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 text-[10px] font-extrabold">
                      Nunggak
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kartu status pribadi */}
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div
            key={selectedStudent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-4"
          >
            {/* Status utama */}
            <div
              className={`rounded-2xl border-2 p-4 ${
                selectedStudent.isLunas
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                  : "border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedStudent.isLunas ? (
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-foreground">
                      {selectedStudent.name}
                    </p>
                    <p
                      className={`text-xs font-extrabold ${
                        selectedStudent.isLunas
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {selectedStudent.isLunas
                        ? "Lunas — Terbayar Penuh"
                        : `Nunggak ${selectedStudent.debtWeeks} minggu (${formatRupiah(selectedStudent.debt)})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Tutup kartu status"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                  <span>
                    Terbayar {formatRupiah(selectedStudent.totalPaid)} dari{" "}
                    {formatRupiah(expectedAmount)}
                  </span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-card">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      selectedStudent.isLunas ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </div>
              </div>

              {/* Tombol Konfirmasi WhatsApp */}
              <div className="mt-3.5 pt-3 border-t border-border/60">
                <button
                  onClick={() => handleWhatsAppConfirm(selectedStudent)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-xs active:scale-98 ${
                    selectedStudent.isLunas
                      ? "bg-card border border-border text-foreground hover:bg-accent"
                      : "bg-[#25D366] text-white hover:bg-[#20bd5a]"
                  }`}
                >
                  {selectedStudent.isLunas ? (
                    <Share2 className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  <span>
                    {selectedStudent.isLunas
                      ? "Kirim Info Lunas ke WhatsApp Bendahara"
                      : "Konfirmasi Pembayaran ke WhatsApp Bendahara"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Riwayat pembayaran */}
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" /> Riwayat Bayar
                </p>
                {selectedStudent.payments.length === 0 ? (
                  <p className="py-4 text-center text-xs font-medium text-muted-foreground">
                    Belum ada pembayaran semester ini.
                  </p>
                ) : (
                  <div className="scrollbar-none max-h-44 space-y-1.5 overflow-y-auto">
                    {[...selectedStudent.payments]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-muted-foreground">
                            {formatDateLong(p.date)}
                          </span>
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            +{formatRupiah(p.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Status iuran khusus */}
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <ClipboardList className="h-3.5 w-3.5" /> Iuran Khusus
                </p>
                {collectionStatus.length === 0 ? (
                  <p className="py-4 text-center text-xs font-medium text-muted-foreground">
                    Tidak ada iuran khusus saat ini.
                  </p>
                ) : (
                  <div className="scrollbar-none max-h-44 space-y-1.5 overflow-y-auto">
                    {collectionStatus.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-foreground">{c.name}</p>
                          <p className="font-mono text-[10px] font-medium text-muted-foreground">
                            {formatRupiah(c.amount)}
                          </p>
                        </div>
                        {c.hasPaid ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold">
                            Sudah
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 text-[10px] font-extrabold">
                            Belum
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground mb-1">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              Cari namamu untuk melihat status & riwayat
            </p>
            <p className="text-[10px] font-medium text-muted-foreground/70">
              Tanpa login — cukup ketik nama untuk cek & konfirmasi bayar
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
