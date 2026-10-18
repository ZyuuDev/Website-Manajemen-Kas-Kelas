"use client";

import { useState } from "react";
import { Search, Check, Minus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";

interface BukuKasMatrixProps {
  students: StudentStats[];
  weeklyAmount: number;
  elapsedWeeks: number;
}

export function BukuKasMatrix({ students, weeklyAmount, elapsedWeeks }: BukuKasMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const maxWeeksToShow = Math.max(10, Math.min(elapsedWeeks + 10, 20));
  const weekNumbers = Array.from({ length: maxWeeksToShow }, (_, index) => index + 1);
  const filteredStudents = searchQuery.trim()
    ? students.filter((student) => student.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : students;

  return (
    <section className="glass-panel glass-section min-w-0">
      <SectionHeading eyebrow="Setoran mingguan" title="Buku kas kelas"
        description={`${students.length} siswa · ${formatRupiah(weeklyAmount)} per minggu`}
        action={
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <input type="search" placeholder="Cari nama siswa…" value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)} aria-label="Cari nama siswa di buku kas"
              className="glass-inset h-11 w-full rounded-2xl pl-10 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary" />
          </div>
        }
      />
      <div className="section-surface min-w-0 overflow-hidden">
        <div className="max-h-110 overflow-auto" role="region" aria-label="Tabel setoran mingguan yang dapat digeser" tabIndex={0}>
          <table className="ledger-table">
            <thead className="matrix-sticky sticky top-0 z-20">
              <tr>
                <th className="matrix-sticky sticky left-0 z-20 text-left">Nama siswa</th>
                <th>Status</th><th className="text-right">Terbayar</th>
                {weekNumbers.map((week) => (
                  <th key={week} className={`min-w-13 text-center ${week === elapsedWeeks ? "ledger-current" : ""}`}>
                    M{week}{week === elapsedWeeks && <span className="mt-1 block text-[8px] text-primary">Saat ini</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={3 + weekNumbers.length} className="py-12 text-center text-muted-foreground">Siswa tidak ditemukan.</td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="matrix-sticky sticky left-0 z-10">
                    <span title={student.name} className="block max-w-32 truncate font-medium sm:max-w-48">{student.name}</span>
                  </td>
                  <td className="text-center"><span className={`status-label ${student.isLunas ? "status-paid" : "status-debt"}`}>{student.isLunas ? "Lunas" : "Belum lunas"}</span></td>
                  <td className="whitespace-nowrap text-right font-medium tabular-nums">{formatRupiah(student.totalPaid)}</td>
                  {weekNumbers.map((week) => {
                    const paid = student.totalPaid >= week * weeklyAmount;
                    const due = week <= elapsedWeeks;
                    return (
                      <td key={week} className={`text-center ${week === elapsedWeeks ? "ledger-current" : ""}`}>
                        <span title={`Minggu ${week}: ${paid ? "Terbayar lunas" : due ? "Belum terbayar" : "Belum jatuh tempo"}`}
                          className={`ledger-mark ${paid ? "status-paid" : due ? "status-debt" : "text-muted-foreground/35"}`}>
                          {paid ? <Check className="size-3" /> : due ? <Minus className="size-3" /> : <span className="size-1 rounded-full bg-current" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><Check className="size-3 text-[var(--tone-paid)]" />Terbayar</span>
          <span className="inline-flex items-center gap-1.5"><Minus className="size-3 text-[var(--tone-debt)]" />Belum terbayar</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1 rounded-full bg-muted-foreground/40" />Mendatang</span>
        </div>
        <span>Geser tabel untuk melihat minggu lain.</span>
      </div>
    </section>
  );
}
