"use client";

import { GlassDialog } from "@/components/GlassDialog";
import { ArrowUpRight, Printer, FileSpreadsheet } from "lucide-react";
import { formatRupiah, formatDateLong } from "@/lib/utils";
import type {
  ClassInfo,
  DashboardStats,
  ExpenseRecord,
  MiscIncomeRecord,
  StudentStats,
} from "@/lib/types";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  stats: DashboardStats;
  students: StudentStats[];
  expenses: ExpenseRecord[];
  miscIncomes?: MiscIncomeRecord[];
}

export function ExportReportModal({
  isOpen,
  onClose,
  classInfo,
  stats,
  students,
  expenses,
}: ExportReportModalProps) {

  const todayStr = formatDateLong(new Date().toISOString());

  // Helper 1: Download CSV
  const handleDownloadCSV = () => {
    const lines: string[] = [];

    lines.push(`LAPORAN KEUANGAN KAS KELAS - ${classInfo.name.toUpperCase()}`);
    lines.push(`Tahun Ajaran / Semester: ${classInfo.academicYear}`);
    lines.push(`Tanggal Cetak: ${todayStr}`);
    lines.push(``);

    // Section 1: Ringkasan
    lines.push(`1. RINGKASAN KEUANGAN`);
    lines.push(`Item,Jumlah`);
    lines.push(`Saldo Kas Real-time,${stats.liveBalance}`);
    lines.push(`Total Pemasukan,${stats.totalIncome}`);
    lines.push(`Total Pengeluaran,${stats.totalExpense}`);
    lines.push(`Total Tunggakan Siswa,${stats.totalDebt}`);
    lines.push(``);

    // Section 2: Data Siswa
    lines.push(`2. REKAPITULASI PEMBAYARAN SISWA`);
    lines.push(`No,Nama Siswa,NIS,Status,Total Terbayar (Rp),Tunggakan (Rp),Nunggak (Minggu)`);
    students.forEach((s, idx) => {
      lines.push(
        `${idx + 1},"${s.name}",${s.nis || "-"},${s.isLunas ? "LUNAS" : "NUNGGAK"},${s.totalPaid},${s.debt},${s.debtWeeks}`
      );
    });
    lines.push(``);

    // Section 3: Pengeluaran
    lines.push(`3. RINCIAN PENGELUARAN KAS`);
    lines.push(`No,Tanggal,Kategori,Keterangan,Nominal (Rp)`);
    expenses.forEach((e, idx) => {
      lines.push(
        `${idx + 1},${e.date},"${e.category || "Lainnya"}","${e.title}",${e.amount}`
      );
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Kas_${classInfo.slug || "kelas"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper 2: Print PDF
  const handlePrintPDF = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Kas Kelas ${classInfo.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 24px; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; color: #0f172a; }
          .header p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .card-title { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; }
          .card-value { font-size: 16px; font-weight: bold; margin-top: 4px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #e2e8f0; font-size: 11px; text-transform: uppercase; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge-lunas { color: #166534; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          .badge-nunggak { color: #991b1b; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          .footer { text-align: right; margin-top: 40px; }
          .footer p { margin: 2px 0; font-[11px]; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN KEUANGAN KAS KELAS ${classInfo.name.toUpperCase()}</h1>
          <p>Tahun Ajaran: ${classInfo.academicYear} · Tanggal Cetak: ${todayStr}</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Saldo Kas</div>
            <div class="card-value">${formatRupiah(stats.liveBalance)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Pemasukan</div>
            <div class="card-value">${formatRupiah(stats.totalIncome)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Pengeluaran</div>
            <div class="card-value">${formatRupiah(stats.totalExpense)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Tunggakan</div>
            <div class="card-value">${formatRupiah(stats.totalDebt)}</div>
          </div>
        </div>

        <h3>1. Rekapitulasi Pembayaran Siswa</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Status</th>
              <th style="text-align:right">Terbayar</th>
              <th style="text-align:right">Tunggakan</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .map(
                (s, i) => `
              <tr>
                <td style="width:30px; text-align:center">${i + 1}</td>
                <td><strong>${s.name}</strong></td>
                <td>
                  ${
                    s.isLunas
                      ? '<span class="badge-lunas">LUNAS</span>'
                      : `<span class="badge-nunggak">NUNGGAK ${s.debtWeeks} MG</span>`
                  }
                </td>
                <td style="text-align:right">${formatRupiah(s.totalPaid)}</td>
                <td style="text-align:right; color: ${s.debt > 0 ? "#991b1b" : "#64748b"}">${formatRupiah(s.debt)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h3>2. Rincian Pengeluaran Kas</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th style="text-align:right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.length === 0 ? '<tr><td colSpan="5" style="text-align:center">Belum ada pengeluaran</td></tr>' : expenses
              .map(
                (e, i) => `
              <tr>
                <td style="width:30px; text-align:center">${i + 1}</td>
                <td>${e.date}</td>
                <td>${e.category || "Lainnya"}</td>
                <td>${e.title}</td>
                <td style="text-align:right; font-weight:bold">${formatRupiah(e.amount)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Mengetahui,</p>
          <br><br><br>
          <p><strong>Bendahara Kelas ${classInfo.name}</strong></p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (
    <GlassDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}
      eyebrow="Dokumen kelas" title="Unduh laporan" description={`${classInfo.name} · ${classInfo.academicYear}`}>
      <dl className="section-surface grid grid-cols-2 gap-4 p-5">
        <div><dt className="text-[10px] text-muted-foreground">Saldo kas</dt><dd className="mt-2 break-words text-lg font-medium tracking-tight tabular-nums">{formatRupiah(stats.liveBalance)}</dd></div>
        <div><dt className="text-[10px] text-muted-foreground">Tunggakan</dt><dd className="mt-2 break-words text-lg font-medium tracking-tight tabular-nums">{formatRupiah(stats.totalDebt)}</dd></div>
      </dl>
      <div className="mt-1 space-y-3">
        <button type="button" onClick={handlePrintPDF} className="export-option"><Printer className="size-5 shrink-0 text-primary" /><div className="flex-1"><p className="text-xs font-semibold">Cetak / simpan PDF</p><p className="mt-1 text-[10px] text-muted-foreground">Laporan kas dengan format siap cetak.</p></div><ArrowUpRight className="size-3.5 text-muted-foreground" /></button>
        <button type="button" onClick={handleDownloadCSV} className="export-option"><FileSpreadsheet className="size-5 shrink-0 text-primary" /><div className="flex-1"><p className="text-xs font-semibold">Unduh CSV</p><p className="mt-1 text-[10px] text-muted-foreground">Data siswa dan transaksi untuk spreadsheet.</p></div><ArrowUpRight className="size-3.5 text-muted-foreground" /></button>
      </div>
    </GlassDialog>
  );
}
