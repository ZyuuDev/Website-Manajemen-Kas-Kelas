"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  UserCheck,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
}

interface StudentStats {
  id: string;
  name: string;
  nis: string;
  totalPaid: number;
  debt: number;
  debtWeeks: number;
  isLunas: boolean;
  payments: PaymentRecord[];
}

interface StudentSearchProps {
  students: StudentStats[];
  elapsedWeeks: number;
  weeklyAmount: number;
}

export function StudentSearch({
  students,
  elapsedWeeks,
  weeklyAmount,
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const progressPct = selectedStudent
    ? Math.min(100, (selectedStudent.totalPaid / Math.max(1, expectedAmount)) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Search className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Self-Check Status Kas</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground pl-10">
          Cari nama Anda untuk memeriksa status pembayaran &amp; riwayat transaksi
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          id="student-search-input"
          type="text"
          placeholder="Ketik nama lengkap atau panggilan Anda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-[#050810] pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {filteredStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-[#050810] p-1.5 shadow-2xl max-h-56 overflow-y-auto"
            >
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Hasil ({filteredStudents.length})
              </p>
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelect(student)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {student.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/60">
                      NIS: {student.nis}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      student.isLunas
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {student.isLunas ? "Lunas" : "Nunggak"}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
          {searchQuery.trim() && filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-[#050810] px-4 py-5 text-center text-xs text-muted-foreground shadow-2xl"
            >
              Nama tidak ditemukan. Periksa ejaan Anda.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Student Detail */}
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div
            key={selectedStudent.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-5"
          >
            {/* Status + Stats 3-col grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Status badge */}
              <div
                className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center ${
                  selectedStudent.isLunas
                    ? "border-primary/20 bg-primary/5"
                    : "border-destructive/20 bg-destructive/5"
                }`}
              >
                {selectedStudent.isLunas ? (
                  <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-destructive mb-2 animate-pulse" />
                )}
                <p className="text-sm font-bold text-slate-100 leading-tight">
                  {selectedStudent.name}
                </p>
                <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/60">
                  NIS: {selectedStudent.nis}
                </p>
                <span
                  className={`mt-3 rounded-full px-3 py-1 text-[10px] font-bold ${
                    selectedStudent.isLunas
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {selectedStudent.isLunas ? "✓ LUNAS" : "⚠ ADA TUNGGAKAN"}
                </span>
              </div>

              {/* Finance summary */}
              <div className="rounded-2xl border border-border bg-white/[0.01] p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Ikhtisar Kas
                </p>
                {[
                  {
                    label: "Total Dibayar",
                    value: formatRupiah(selectedStudent.totalPaid),
                    cls: "text-primary",
                  },
                  {
                    label: `Wajib (W${elapsedWeeks})`,
                    value: formatRupiah(expectedAmount),
                    cls: "text-slate-300",
                  },
                  {
                    label: "Sisa Tunggakan",
                    value: formatRupiah(selectedStudent.debt),
                    cls: selectedStudent.debt > 0 ? "text-destructive" : "text-primary",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-mono font-bold ${row.cls}`}>{row.value}</span>
                  </div>
                ))}
                {/* Progress bar */}
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                    <span>Progres Pelunasan</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        selectedStudent.isLunas ? "bg-primary" : "bg-destructive"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Time stats */}
              <div className="rounded-2xl border border-border bg-white/[0.01] p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Info Periode
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-white/[0.03]">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Minggu Berjalan</p>
                    <p className="text-sm font-bold text-slate-200">
                      Minggu Ke-{elapsedWeeks}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-white/[0.03]">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Iuran / Minggu</p>
                    <p className="text-sm font-bold text-slate-200">
                      {formatRupiah(weeklyAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Riwayat Pembayaran Kas
                </p>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                {selectedStudent.payments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Belum ada riwayat pembayaran kas tercatat.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-slate-950/40">
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            No. Transaksi
                          </th>
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Tanggal
                          </th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Nominal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.payments.map((p, i) => (
                          <tr
                            key={p.id}
                            className={`border-b border-border hover:bg-white/[0.01] transition-colors ${
                              i === selectedStudent.payments.length - 1
                                ? "border-b-0"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground/60">
                              #{p.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-4 py-2.5 text-slate-300">
                              {formatDate(p.date)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">
                              {formatRupiah(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-slate-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Tutup detail siswa
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/[0.01] py-10 text-center"
          >
            <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              Cari nama Anda di atas untuk melihat status kas secara detail.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
