"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import type { StudentStats } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";

interface WallOfShameProps {
  students: StudentStats[];
  weeklyAmount: number;
}

type StudentTab = "fame" | "debtors";

export function WallOfShame({ students }: WallOfShameProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>("fame");
  const id = useId();
  const debtors = students.filter((student) => student.debt > 0)
    .sort((a, b) => b.debt - a.debt);
  const paidStudents = students.filter((student) => student.isLunas)
    .sort((a, b) => b.totalPaid - a.totalPaid || a.name.localeCompare(b.name));
  const visibleStudents = activeTab === "fame" ? paidStudents : debtors;

  const navigateTabs = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: StudentTab = event.key === "Home" ? "fame" : event.key === "End" ? "debtors" : activeTab === "fame" ? "debtors" : "fame";
    setActiveTab(next);
    document.getElementById(`${id}-${next}`)?.focus();
  };

  return (
    <section className="glass-panel glass-section fame-board flex h-full min-w-0 flex-col">
      <SectionHeading
        eyebrow="Rekap siswa"
        title="Wall of Fame"
        description="Urutan berdasarkan total setoran."
        action={
          <div className="text-right">
            <p className="text-xl font-medium tracking-tight tabular-nums">{paidStudents.length}<span className="text-sm text-muted-foreground"> / {students.length}</span></p>
            <p className="mt-1 text-[9px] text-muted-foreground">siswa lunas</p>
          </div>
        }
      />
      <div className="fame-tabs" role="tablist" aria-label="Status setoran siswa">
        {([
          ["fame", "Lunas", paidStudents.length],
          ["debtors", "Belum lunas", debtors.length],
        ] as const).map(([tab, label, count]) => (
          <button key={tab} id={`${id}-${tab}`} type="button" role="tab"
            aria-selected={activeTab === tab} aria-controls={`${id}-list`}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)} onKeyDown={navigateTabs} className="fame-tab">
            {label}<span>{count}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between py-3 text-[9px] text-muted-foreground">
        <span>Nama siswa</span><span>{activeTab === "fame" ? "Terbayar" : "Tunggakan"}</span>
      </div>
      <div id={`${id}-list`} role="tabpanel" aria-labelledby={`${id}-${activeTab}`}
        tabIndex={0} className="min-h-48 max-h-84 flex-1 overflow-y-auto pr-1">
        {visibleStudents.length === 0 ? (
          <div className="panel-empty">
            <strong>{activeTab === "fame" ? "Belum ada siswa yang lunas." : "Semua siswa sudah lunas."}</strong>
            <p className="mt-1 text-[11px]">{activeTab === "fame" ? "Daftar ini diperbarui setelah pembayaran dicatat." : "Tidak ada tunggakan yang perlu ditampilkan."}</p>
          </div>
        ) : (
          <ol>
            {visibleStudents.map((student, index) => (
              <li key={student.id} className="fame-row">
                <span className="fame-position" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="text-[11px] leading-relaxed font-medium">{student.name}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">{activeTab === "fame" ? "Iuran lunas" : `${student.debtWeeks} minggu belum terbayar`}</p>
                </div>
                <span className={`text-[11px] font-medium tabular-nums ${activeTab === "fame" ? "text-primary" : "text-[var(--tone-debt)]"}`}>
                  {formatRupiah(activeTab === "fame" ? student.totalPaid : student.debt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
