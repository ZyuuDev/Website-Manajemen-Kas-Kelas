"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Check,
  X,
  Minus,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";

interface BukuKasMatrixProps {
  students: StudentStats[];
  weeklyAmount: number;
  elapsedWeeks: number;
}

export function BukuKasMatrix({
  students,
  weeklyAmount,
  elapsedWeeks,
}: BukuKasMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Tampilkan minggu dari M1 sampai (minggu berjalan + 10 minggu ke depan), minimal 10 minggu
  const maxWeeksToShow = Math.max(10, Math.min(elapsedWeeks + 10, 20));
  const weekNumbers = Array.from({ length: maxWeeksToShow }, (_, i) => i + 1);

  const filteredStudents = searchQuery.trim()
    ? students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-foreground">
                Buku Kas Online (Leger Setoran)
              </h3>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Matriks Mingguan
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Rekapitulasi setoran kas tiap siswa per minggu (Lunas ✓ · Nunggak ✗)
            </p>
          </div>
        </div>

        {/* Input pencarian */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama siswa…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs font-semibold outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tabel Matriks dengan Scroll Horizontal & Sticky Left Column */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-background">
        <div className="scrollbar-none overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-card/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="sticky left-0 z-20 bg-card px-4 py-3 shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.08)]">
                  Nama Siswa
                </th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Total Bayar</th>
                {weekNumbers.map((w) => {
                  const isCurrent = w === elapsedWeeks;
                  return (
                    <th
                      key={w}
                      className={`px-2.5 py-3 text-center whitespace-nowrap min-w-[54px] ${
                        isCurrent
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span>M{w}</span>
                        {isCurrent && (
                          <span className="text-[8px] font-bold tracking-tight text-indigo-500 uppercase">
                            Saat Ini
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + weekNumbers.length}
                    className="py-8 text-center text-xs font-medium text-muted-foreground"
                  >
                    Siswa tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  return (
                    <tr
                      key={std.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      {/* Sticky Nama Siswa */}
                      <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-bold text-foreground shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">
                            {std.name}
                          </span>
                        </div>
                      </td>

                      {/* Badge Status Ringkas */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {std.isLunas ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold">
                            <Check className="h-3 w-3 stroke-[3]" />
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 text-[10px] font-extrabold">
                            <X className="h-3 w-3 stroke-[3]" />
                            Nunggak
                          </span>
                        )}
                      </td>

                      {/* Total Nominal Terbayar */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-muted-foreground whitespace-nowrap">
                        {formatRupiah(std.totalPaid)}
                      </td>

                      {/* Grid Status Per Minggu */}
                      {weekNumbers.map((w) => {
                        const requiredAmount = w * weeklyAmount;
                        const isCovered = std.totalPaid >= requiredAmount;
                        const isPastOrCurrent = w <= elapsedWeeks;
                        const isCurrent = w === elapsedWeeks;

                        return (
                          <td
                            key={w}
                            className={`px-2 py-2 text-center align-middle ${
                              isCurrent
                                ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                                : ""
                            }`}
                          >
                            <div className="flex justify-center">
                              {isCovered ? (
                                <span
                                  title={`Minggu ${w}: Terbayar Lunas`}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-400 dark:border-emerald-800 shadow-2xs"
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                              ) : isPastOrCurrent ? (
                                <span
                                  title={`Minggu ${w}: Belum Terbayar (Nunggak)`}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-400 dark:border-rose-800 shadow-2xs"
                                >
                                  <X className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span
                                  title={`Minggu ${w}: Belum Jatuh Tempo`}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground/40 border border-border/50"
                                >
                                  <Minus className="h-3 w-3 stroke-[2]" />
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda & Catatan Keterangan */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-[11px] font-medium text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground/80">
            Keterangan Simbol:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-400 dark:border-emerald-800">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <span>Lunas / Terbayar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-400 dark:border-rose-800">
              <X className="h-3 w-3 stroke-[3]" />
            </span>
            <span>Nunggak (Lewat Jatuh Tempo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/30 text-muted-foreground/40 border border-border/50">
              <Minus className="h-3 w-3 stroke-[2]" />
            </span>
            <span>Belum Jatuh Tempo</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          *Minggu-minggu mendatang tercentang otomatis bila siswa membayar di muka.
        </p>
      </div>
    </div>
  );
}
