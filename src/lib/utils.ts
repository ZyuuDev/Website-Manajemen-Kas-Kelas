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

// Timezone-safe local date parser (mengabaikan UTC offset pergeseran jam 00:00-07:00 WIB)
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Jumlah minggu MENTAH yang sudah berjalan sejak tanggal mulai semester
// (minggu ke-1 dimulai tepat di tanggal mulai; belum dikurangi minggu libur)
export function calculateWeeksElapsed(startDateStr: string): number {
  const start = parseLocalDate(startDateStr);
  const today = new Date();
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
  const start = parseLocalDate(startDateStr);
  const date = parseLocalDate(dateStr);

  const diffDays = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const rawIndex = Math.max(0, Math.floor(diffDays / 7));

  // Deduplikasi tanggal libur agar jika ada data ganda di DB tidak dihitung 2x
  const uniqueOffWeekDates = Array.from(
    new Set(
      offWeekDates.map((ow) => {
        const match = ow.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : ow;
      })
    )
  );

  let offBefore = 0;
  for (const ow of uniqueOffWeekDates) {
    const owDate = parseLocalDate(ow);
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
  return parseLocalDate(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format tanggal panjang Indonesia, contoh: 15 Juli 2026
export function formatDateLong(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
