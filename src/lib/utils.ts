import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format angka ke Rupiah tanpa desimal, contoh: Rp1.250.000
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Jumlah minggu MENTAH yang sudah berjalan sejak tanggal mulai semester
// (minggu ke-1 dimulai tepat di tanggal mulai; belum dikurangi minggu libur)
export function calculateWeeksElapsed(startDateStr: string): number {
  const start = new Date(startDateStr);
  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (today < start) return 0;

  const diffDays = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor(diffDays / 7) + 1;
}

// Indeks minggu EFEKTIF (0-based) sebuah tanggal, dengan minggu libur
// dikeluarkan dari hitungan. Transaksi yang jatuh tepat di minggu libur
// digabungkan ke minggu efektif berikutnya.
export function getAdjustedWeekIndex(
  dateStr: string,
  startDateStr: string,
  offWeekDates: string[]
): number {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const rawIndex = Math.max(0, Math.floor(diffDays / 7));

  let offBefore = 0;
  for (const ow of offWeekDates) {
    const owDate = new Date(ow);
    owDate.setHours(0, 0, 0, 0);
    const owDiff = Math.floor(
      (owDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const owIndex = Math.floor(owDiff / 7);
    if (owIndex >= 0 && owIndex < rawIndex) offBefore++;
  }

  return Math.max(0, rawIndex - offBefore);
}

// Format tanggal pendek Indonesia, contoh: 15 Jul 2026
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format tanggal panjang Indonesia, contoh: 15 Juli 2026
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
