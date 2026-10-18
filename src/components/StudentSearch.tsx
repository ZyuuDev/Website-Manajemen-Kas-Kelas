"use client";

import { useState } from "react";

import { Search, X, MessageCircle, ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
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
      : `Halo Bendahara ${classNameText},\nSaya *${student.name}* (NIS: ${student.nis || "-"}).\nSaya ingin konfirmasi pembayaran uang kas:\n• Status: Nunggak ${student.debtWeeks} minggu\n• Nominal Kas: ${formatRupiah(student.debt)}${collectionText}\n\nBerikut saya lampirkan bukti pembayaran. Mohon dicek dan dicatat ya. Terima kasih.`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="glass-panel glass-section flex h-full min-w-0 flex-col">
      <SectionHeading eyebrow="Status iuran" title="Cek setoranmu" description="Pilih nama untuk melihat pembayaran dan tagihan." />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
        <input id="student-search-input" type="text" autoComplete="off" placeholder="Cari nama kamu…"
          aria-label="Cari nama untuk melihat status iuran" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
          className="glass-inset h-12 w-full rounded-2xl pl-11 pr-11 text-xs outline-none placeholder:text-muted-foreground focus:border-primary" />
        {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Hapus pencarian" className="absolute right-1 top-1 flex size-10 items-center justify-center text-muted-foreground"><X className="size-3.5" /></button>}
        {searchQuery.trim() && (
          <div className="glass-popover absolute inset-x-0 top-full z-20 mt-2 max-h-60 overflow-y-auto p-2">
            {filteredStudents.length === 0 ? <p className="p-4 text-xs text-muted-foreground">Nama tidak ditemukan.</p> : filteredStudents.map((student) => (
              <button key={student.id} type="button" onClick={() => handleSelect(student)} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left text-xs hover:bg-accent">
                <span className="min-w-0 font-medium">{student.name}</span>
                <span className={`status-label ${student.isLunas ? "status-paid" : "status-debt"}`}>{student.isLunas ? "Lunas" : "Belum lunas"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div key={selectedStudent.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }} className="mt-5 space-y-5">
            <div className="student-summary">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><h4 className="text-sm font-semibold leading-relaxed">{selectedStudent.name}</h4><span className={`status-label mt-2 ${selectedStudent.isLunas ? "status-paid" : "status-debt"}`}>{selectedStudent.isLunas ? "Iuran lunas" : `Belum bayar ${selectedStudent.debtWeeks} minggu`}</span></div>
                <button type="button" onClick={() => setSelectedStudent(null)} aria-label="Tutup kartu status" className="icon-button shrink-0"><X className="size-3.5" /></button>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div><dt className="text-[10px] text-muted-foreground">Sudah terbayar</dt><dd className="mt-1.5 break-words text-lg font-medium tracking-tight text-primary tabular-nums">{formatRupiah(selectedStudent.totalPaid)}</dd></div>
                <div><dt className="text-[10px] text-muted-foreground">Sisa tagihan</dt><dd className="mt-1.5 break-words text-lg font-medium tracking-tight tabular-nums">{formatRupiah(selectedStudent.debt)}</dd></div>
              </dl>
              <div className="mt-5 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{ width: `${progressPct}%` }} /></div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Kewajiban sampai minggu ke-{elapsedWeeks}: {formatRupiah(expectedAmount)}</p>
              <button type="button" onClick={() => handleWhatsAppConfirm(selectedStudent)} className={`glass-button mt-5 w-full px-3 py-2.5 text-[11px] font-semibold ${selectedStudent.isLunas ? "" : "glass-button-primary"}`}>
                <MessageCircle className="size-3.5 shrink-0" />{selectedStudent.isLunas ? "Bagikan status ke bendahara" : "Konfirmasi ke bendahara"}<ArrowUpRight className="ml-auto size-3.5 shrink-0" />
              </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="min-w-0"><h4 className="mb-1 text-xs font-semibold">Riwayat pembayaran</h4>
                {selectedStudent.payments.length === 0 ? <p className="mt-3 text-[11px] text-muted-foreground">Belum ada pembayaran.</p> : (
                  <div className="max-h-52 overflow-y-auto pr-1">{[...selectedStudent.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                    <div key={payment.id} className="student-record"><span className="text-muted-foreground">{formatDateLong(payment.date)}</span><span className="shrink-0 font-medium tabular-nums">{formatRupiah(payment.amount)}</span></div>
                  ))}</div>
                )}
              </div>
              <div className="min-w-0"><h4 className="mb-1 text-xs font-semibold">Iuran khusus</h4>
                {collectionStatus.length === 0 ? <p className="mt-3 text-[11px] text-muted-foreground">Tidak ada iuran khusus.</p> : (
                  <div className="max-h-52 overflow-y-auto pr-1">{collectionStatus.map((collection) => (
                    <div key={collection.id} className="student-record"><div className="min-w-0"><p className="leading-relaxed">{collection.name}</p><p className="mt-1 text-[10px] text-muted-foreground tabular-nums">{formatRupiah(collection.amount)}</p></div><span className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${collection.hasPaid ? "text-[var(--tone-paid)]" : "text-muted-foreground"}`}>{collection.hasPaid && <Check className="size-3" />}{collection.hasPaid ? "Sudah" : "Belum"}</span></div>
                  ))}</div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel-empty mt-5 flex-1">
            <strong>Belum ada siswa dipilih.</strong><p className="mt-2 max-w-64 text-[11px]">Cari namamu di atas. Riwayat setoran dan rincian tagihan akan muncul di sini.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-5 text-[10px] text-muted-foreground">{students.length} siswa terdaftar · Iuran {formatRupiah(weeklyAmount)} / minggu</p>
    </section>
  );
}
