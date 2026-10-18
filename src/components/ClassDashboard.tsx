"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Calendar,
  RefreshCw,
  AlertCircle,
  QrCode,
  CalendarOff,
  Download,
  ExternalLink,
  ArrowUpRight,
  Users,
  Leaf,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassDialog } from "@/components/GlassDialog";
import { supabase } from "@/lib/supabase";
import {
  calculateWeeksElapsed,
  getAdjustedWeekIndex,
  parseLocalDate,
  formatRupiah,
} from "@/lib/utils";
import type {
  CashFlowWeek,
  ClassInfo,
  DashboardStats,
  ExpenseRecord,
  MiscIncomeRecord,
  PaymentRecord,
  SpecialCollectionInfo,
  StudentStats,
} from "@/lib/types";
import { BalanceCard } from "@/components/BalanceCard";
import { CashFlowChart } from "@/components/CashFlowChart";
import { ExpenseBreakdownChart } from "@/components/ExpenseBreakdownChart";
import { WallOfShame } from "@/components/WallOfShame";
import { StudentSearch } from "@/components/StudentSearch";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SpecialCollectionsPanel } from "@/components/SpecialCollectionsPanel";
import { BukuKasMatrix } from "@/components/BukuKasMatrix";
import { ExportReportModal } from "@/components/ExportReportModal";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ClassDashboardProps {
  /** Slug kelas. Kosongkan untuk mode 1-kelas: otomatis pakai kelas default. */
  slug?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "not-found"; allClasses: { name: string; slug: string }[] }
  | { status: "no-semester"; className: string }
  | { status: "empty" }
  | { status: "ready" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ClassDashboard({ slug }: ClassDashboardProps) {
  const router = useRouter();

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<CashFlowWeek[]>([]);
  const [specialCollections, setSpecialCollections] = useState<SpecialCollectionInfo[]>([]);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDownloadingQris, setIsDownloadingQris] = useState(false);

  const handleDownloadQris = async () => {
    if (!classInfo?.qrisUrl) return;
    try {
      setIsDownloadingQris(true);
      const response = await fetch(classInfo.qrisUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `QRIS-Kas-${classInfo.name.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Gagal download otomatis, membuka tab baru:", err);
      window.open(classInfo.qrisUrl, "_blank");
    } finally {
      setIsDownloadingQris(false);
    }
  };

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    async function loadData(isInitial = true) {
      try {
        if (isInitial) setLoadState({ status: "loading" });

        // 1. Cari kelas: via slug, atau kelas default (mode 1 kelas)
        const classColumns = "id, name, slug, weekly_fee, semester_start_date, qris_url";
        let classData: any = null;

        if (slug) {
          const { data } = await supabase
            .from("classes")
            .select(classColumns)
            .eq("slug", slug.toLowerCase())
            .maybeSingle();
          classData = data;
        } else {
          const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_CLASS_SLUG;
          if (defaultSlug) {
            const { data } = await supabase
              .from("classes")
              .select(classColumns)
              .eq("slug", defaultSlug.toLowerCase())
              .maybeSingle();
            classData = data;
          }
          if (!classData) {
            const { data } = await supabase
              .from("classes")
              .select(classColumns)
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle();
            classData = data;
          }
        }

        if (!classData) {
          if (slug) {
            const { data: classesList } = await supabase
              .from("classes")
              .select("name, slug");
            setLoadState({ status: "not-found", allClasses: classesList || [] });
          } else {
            setLoadState({ status: "empty" });
          }
          return;
        }

        // Jalankan listener Realtime Supabase jika belum aktif
        if (!activeChannel) {
          activeChannel = supabase
            .channel(`sakukelas-realtime-${classData.id}`)
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "transactions", filter: `class_id=eq.${classData.id}` },
              () => loadData(false)
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "special_collections", filter: `class_id=eq.${classData.id}` },
              () => loadData(false)
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "special_collection_payments" },
              () => loadData(false)
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "students", filter: `class_id=eq.${classData.id}` },
              () => loadData(false)
            )
            .subscribe();
        }

        // 2. Semester aktif — seluruh data di bawah dibatasi ke semester ini
        const { data: academicData } = await supabase
          .from("academic_years")
          .select("id, name, start_date")
          .eq("class_id", classData.id)
          .eq("is_active", true)
          .maybeSingle();

        if (!academicData) {
          setLoadState({ status: "no-semester", className: classData.name });
          return;
        }

        const semesterStart: string =
          academicData.start_date || classData.semester_start_date;

        // 3. Data siswa (kolom eksplisit — phone_number tidak boleh diakses publik)
        const { data: studentsData } = await supabase
          .from("students")
          .select("id, class_id, name, nis, is_active")
          .eq("class_id", classData.id)
          .eq("is_active", true);

        // 4. Transaksi SEMESTER AKTIF saja (perbaikan bug Tutup Buku)
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("*")
          .eq("class_id", classData.id)
          .eq("academic_year_id", academicData.id)
          .order("date", { ascending: false });

        // 5. Minggu libur semester aktif
        const { data: offWeeksData } = await supabase
          .from("off_weeks")
          .select("start_date")
          .eq("class_id", classData.id)
          .eq("academic_year_id", academicData.id);

        // 6. Iuran khusus semester aktif + pembayarannya
        const { data: collectionsData } = await supabase
          .from("special_collections")
          .select("*")
          .eq("class_id", classData.id)
          .eq("academic_year_id", academicData.id)
          .order("created_at", { ascending: false });

        const collectionIds = (collectionsData || []).map((c: any) => c.id);
        const { data: collectionPaymentsData } = collectionIds.length > 0
          ? await supabase
              .from("special_collection_payments")
              .select("collection_id, student_id")
              .in("collection_id", collectionIds)
          : { data: [] };

        // ── Hitung minggu efektif (dikurangi minggu libur) ──
        const rawOffWeekDates = (offWeeksData || []).map((ow: any) => ow.start_date as string);
        const offWeekDates = Array.from(
          new Set(
            rawOffWeekDates.map((ow) => {
              const match = ow.match(/^(\d{4}-\d{2}-\d{2})/);
              return match ? match[1] : ow;
            })
          )
        );

        const rawWeeks = calculateWeeksElapsed(semesterStart);
        const start = parseLocalDate(semesterStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let offWeekCount = 0;
        for (const ow of offWeekDates) {
          const owDate = parseLocalDate(ow);
          if (owDate >= start && owDate <= today) offWeekCount++;
        }
        const elapsedWeeks = Math.max(0, rawWeeks - offWeekCount);

        // ── Kelompokkan transaksi ──
        const txs = transactionsData || [];
        const paymentsByStudent = new Map<string, PaymentRecord[]>();
        const miscIncomesData: MiscIncomeRecord[] = [];
        const expensesData: ExpenseRecord[] = [];

        for (const tx of txs) {
          if (tx.type === "INCOME" && tx.student_id) {
            const list = paymentsByStudent.get(tx.student_id) || [];
            list.push({
              id: tx.id,
              studentId: tx.student_id,
              amount: tx.amount,
              date: tx.date,
            });
            paymentsByStudent.set(tx.student_id, list);
          } else if (tx.type === "INCOME") {
            miscIncomesData.push({
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              date: tx.date,
            });
          } else if (tx.type === "EXPENSE") {
            let receiptUrl: string = tx.receipt_url || "";
            if (receiptUrl && !receiptUrl.startsWith("http") && !receiptUrl.startsWith("/")) {
              const { data } = supabase.storage.from("receipts").getPublicUrl(receiptUrl);
              receiptUrl = data.publicUrl;
            }
            expensesData.push({
              id: tx.id,
              title: tx.description,
              description: tx.description,
              amount: tx.amount,
              date: tx.date,
              category: tx.category || "Lainnya",
              receiptUrl,
            });
          }
        }

        // ── Statistik per siswa ──
        const mappedStudents: StudentStats[] = (studentsData || []).map((std: any) => {
          const payments = paymentsByStudent.get(std.id) || [];
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          const expectedAmount = elapsedWeeks * classData.weekly_fee;
          const debt = Math.max(0, expectedAmount - totalPaid);
          return {
            id: std.id,
            name: std.name,
            nis: std.nis,
            classId: std.class_id,
            totalPaid,
            payments,
            debt,
            debtWeeks: Math.max(0, Math.ceil(debt / classData.weekly_fee)),
            isLunas: totalPaid >= expectedAmount,
          };
        });

        const totalStudentIncome = mappedStudents.reduce((s, st) => s + st.totalPaid, 0);
        const totalMiscIncome = miscIncomesData.reduce((s, m) => s + m.amount, 0);
        const totalIncome = totalStudentIncome + totalMiscIncome;
        const totalExpense = expensesData.reduce((s, e) => s + e.amount, 0);
        const totalDebt = mappedStudents.reduce((s, st) => s + st.debt, 0);

        // ── Grafik mingguan (indeks minggu memperhitungkan minggu libur) ──
        const weeksData: CashFlowWeek[] = Array.from(
          { length: Math.max(1, elapsedWeeks) },
          (_, i) => ({ name: `Minggu ${i + 1}`, income: 0, expense: 0, balance: 0 })
        );
        const bucket = (dateStr: string) =>
          Math.min(
            weeksData.length - 1,
            getAdjustedWeekIndex(dateStr, semesterStart, offWeekDates)
          );

        for (const std of mappedStudents) {
          for (const p of std.payments) weeksData[bucket(p.date)].income += p.amount;
        }
        for (const m of miscIncomesData) weeksData[bucket(m.date)].income += m.amount;
        for (const e of expensesData) weeksData[bucket(e.date)].expense += e.amount;

        let runningBalance = 0;
        for (const week of weeksData) {
          runningBalance += week.income - week.expense;
          week.balance = runningBalance;
        }

        // ── Iuran khusus ──
        const mappedCollections: SpecialCollectionInfo[] = (collectionsData || []).map(
          (col: any) => {
            const paidIds = (collectionPaymentsData || [])
              .filter((p: any) => p.collection_id === col.id)
              .map((p: any) => p.student_id as string);
            return {
              id: col.id,
              name: col.name,
              amount: col.amount,
              description: col.description,
              createdAt: col.created_at,
              payments: paidIds.map((sid) => ({ studentId: sid })),
              paidIds,
            };
          }
        );

        setClassInfo({
          id: classData.id,
          name: classData.name,
          slug: classData.slug,
          weeklyAmount: classData.weekly_fee,
          semesterStartDate: semesterStart,
          academicYear: academicData.name,
          qrisUrl: classData.qris_url,
        });
        setStudents(mappedStudents);
        setExpenses(expensesData);
        setStats({
          elapsedWeeks,
          totalIncome,
          totalExpense,
          liveBalance: totalIncome - totalExpense,
          totalDebt,
          students: mappedStudents,
          miscIncomes: miscIncomesData,
        });
        setChartData(weeksData);
        setSpecialCollections(mappedCollections);
        setLoadState({ status: "ready" });
      } catch (err) {
        console.error("Gagal memuat data Supabase:", err);
        setLoadState({ status: "empty" });
      }
    }

    loadData();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [slug]);

  /* ── Loading ── */
  if (loadState.status === "loading") {
    return (
      <StatusShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-primary/30 bg-primary/10">
            <RefreshCw className="h-7 w-7 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold">Memuat Data Kelas…</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sinkronisasi dengan catatan bendahara
            </p>
          </div>
        </motion.div>
      </StatusShell>
    );
  }

  /* ── Kelas tidak ditemukan ── */
  if (loadState.status === "not-found") {
    return (
      <StatusShell>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-destructive/30 bg-danger-soft text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Kelas Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kode kelas{" "}
            <span className="rounded-lg bg-danger-soft px-1.5 py-0.5 font-mono text-destructive">
              {slug}
            </span>{" "}
            tidak terdaftar.
          </p>
          {loadState.allClasses.length > 0 && (
            <div className="mt-6 rounded-3xl border-2 border-border bg-card p-4 text-left">
              <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Kelas yang tersedia:
              </p>
              <div className="space-y-1.5">
                {loadState.allClasses.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => router.push(`/c/${c.slug}`)}
                    className="flex w-full items-center justify-between rounded-2xl border-2 border-border bg-background/40 px-3 py-2.5 text-xs font-semibold transition-all hover:border-primary/50 hover:text-primary"
                  >
                    <span>Kelas {c.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </StatusShell>
    );
  }

  /* ── Tidak ada semester aktif ── */
  if (loadState.status === "no-semester") {
    return (
      <StatusShell>
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-warning/40 bg-warning-soft text-warning">
            <CalendarOff className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Belum Ada Semester Aktif</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelas {loadState.className} belum memiliki semester berjalan. Minta
            bendahara membuka semester baru lewat aplikasi.
          </p>
        </div>
      </StatusShell>
    );
  }

  /* ── Tidak ada data sama sekali ── */
  if (loadState.status === "empty" || !classInfo || !stats) {
    return (
      <StatusShell>
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-border bg-muted text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Data Belum Tersedia</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gagal memuat data kelas. Coba muat ulang halaman, atau hubungi
            bendahara kelasmu.
          </p>
        </div>
      </StatusShell>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <a href="#ringkasan" className="skip-link">Langsung ke konten</a>
      {/* Header */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="liquid-glass dashboard-header mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="glass-button glass-button-primary size-11 shrink-0 rounded-2xl">
              <Wallet className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold sm:text-base">
                Saku<span className="text-primary">Kelas</span>
              </p>
              <p className="truncate text-[10px] font-medium text-muted-foreground">
                Uang kita. Cerita kita.
              </p>
            </div>
          </div>

          <nav aria-label="Navigasi dashboard" className="dashboard-nav hidden items-center rounded-full lg:flex">
            <a href="#ringkasan">Ringkasan</a>
            <a href="#buku-kas">Buku kas</a>
            <a href="#cek-iuran">Cek iuran <ArrowUpRight className="ml-1 inline size-3" /></a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              aria-label="Ekspor laporan kas"
              title="Ekspor laporan kas"
              className="glass-button size-11 text-xs font-semibold text-foreground sm:w-auto sm:px-3.5"
            >
              <Download className="size-4 text-primary" />
              <span className="hidden sm:inline">Ekspor</span>
            </button>

            {classInfo.qrisUrl && (
              <button
                onClick={() => setShowQrisModal(true)}
                aria-label="Bayar kas dengan QRIS"
                title="Bayar kas dengan QRIS"
                className="glass-button glass-button-primary size-11 text-xs font-semibold sm:w-auto sm:px-4"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Bayar QRIS</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Konten */}
      <main id="ringkasan" className="section-anchor mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Sapaan */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col justify-between gap-5 pb-1 sm:flex-row sm:items-end sm:pb-2"
        >
          <div>
            <p className="eyebrow mb-3 flex flex-wrap items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{classInfo.name}<span className="font-normal text-primary/40">/</span><span className="font-medium tracking-[.08em] text-muted-foreground">{classInfo.academicYear}</span></p>
            <h1 className="hero-title">Kas kecil.<br className="sm:hidden" /> <em>Rencana besar.</em></h1>
            <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">Satu kelas, satu tujuan. Semua tercatat, semua bisa lihat.</p>
          </div>
          <div className="hidden w-fit shrink-0 items-center gap-3 pb-1 sm:flex">
            <div className="flex pl-2" aria-hidden="true">
              {students.slice(0, 3).map((student) => (
                <span key={student.id} className="class-portrait">{student.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</span>
              ))}
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold"><Users className="size-3" />{students.length} siswa, satu dompet.</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Iuran {formatRupiah(classInfo.weeklyAmount)} / minggu</p>
            </div>
          </div>
        </motion.div>

        {/* Baris 1: Saldo & metrik */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <BalanceCard
            liveBalance={stats.liveBalance}
            totalIncome={stats.totalIncome}
            totalExpense={stats.totalExpense}
            totalDebt={stats.totalDebt}
          />
        </motion.section>

        <div className="flex flex-wrap items-end justify-between gap-3 px-1 pt-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Ringkasan keuangan</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/30 px-3 py-2 text-[10px] font-semibold text-muted-foreground dark:border-white/20 dark:bg-white/5"><Calendar className="size-3.5 text-primary" />Minggu ke-{stats.elapsedWeeks}</span>
        </div>

        {/* Baris 2: Grafik Arus Kas + Alokasi Pengeluaran */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <CashFlowChart data={chartData} />
          </div>
          <div>
            <ExpenseBreakdownChart expenses={expenses} />
          </div>
        </motion.section>

        {/* Baris 3: Buku Kas Online (Matriks Setoran Mingguan) — FULL WIDTH */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          id="buku-kas"
          className="section-anchor w-full min-w-0"
        >
          <BukuKasMatrix
            students={stats.students}
            weeklyAmount={classInfo.weeklyAmount}
            elapsedWeeks={stats.elapsedWeeks}
          />
        </motion.section>

        {/* Baris 4: Self-Check Siswa + Wall of Fame / Papan Tunggakan */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          id="cek-iuran"
          className="section-anchor grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <StudentSearch
              students={stats.students}
              elapsedWeeks={stats.elapsedWeeks}
              weeklyAmount={classInfo.weeklyAmount}
              allCollections={specialCollections}
              classNameText={classInfo.name}
            />
          </div>
          <div>
            <WallOfShame students={stats.students} weeklyAmount={classInfo.weeklyAmount} />
          </div>
        </motion.section>

        {/* Baris 5: Aktivitas Terkini + Iuran Khusus */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className={`grid grid-cols-1 gap-5 sm:gap-6 ${
            specialCollections.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"
          }`}
        >
          <div>
            <ActivityFeed
              students={students}
              expenses={expenses}
              miscIncomes={stats.miscIncomes}
            />
          </div>
          {specialCollections.length > 0 && (
            <div>
              <SpecialCollectionsPanel
                collections={specialCollections}
                students={stats.students.map((s) => ({ id: s.id, name: s.name, nis: s.nis }))}
              />
            </div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-4 border-t border-white/50 py-7 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="glass-icon flex size-8 items-center justify-center rounded-xl bg-accent text-primary">
              <Leaf className="size-4" />
            </div>
            <span className="text-xs font-extrabold text-foreground tracking-tight">
              Saku<span className="text-primary">Kelas</span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right text-xs font-medium text-muted-foreground">
            <p className="inline-flex items-center gap-1.5 font-semibold text-foreground/85">
              SakuKelas · Portal Transparansi Kas Kelas
            </p>
            <p className="text-[11px]">
              Data tersinkronisasi otomatis · Mode hanya-baca (Read-Only)
            </p>
          </div>
        </div>
      </footer>

      <GlassDialog open={showQrisModal && !!classInfo.qrisUrl} onOpenChange={setShowQrisModal}
        eyebrow="QRIS kelas" title="Bayar iuran" description="Scan menggunakan e-wallet atau mobile banking.">
        {classInfo.qrisUrl && <>
          <div className="flex aspect-square max-h-80 items-center justify-center rounded-2xl bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={classInfo.qrisUrl} alt="QRIS Pembayaran Kas Kelas" className="h-full w-full rounded-lg object-contain" />
          </div>
          <p className="section-surface p-4 text-[11px] leading-relaxed text-muted-foreground">Setelah transfer, kirim bukti pembayaran ke bendahara agar setoranmu dicatat.</p>
          <button type="button" onClick={handleDownloadQris} disabled={isDownloadingQris} className="glass-button glass-button-primary w-full px-4 py-2.5 text-xs font-semibold disabled:opacity-50"><Download className="size-4" />{isDownloadingQris ? "Mengunduh…" : "Unduh gambar QRIS"}</button>
          <a href={classInfo.qrisUrl} target="_blank" rel="noreferrer" className="glass-button w-full px-4 py-2 text-[11px] font-medium"><ExternalLink className="size-3.5" />Buka gambar penuh</a>
        </>}
      </GlassDialog>

      {/* Modal Ekspor Laporan */}
      {stats && (
        <ExportReportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          classInfo={classInfo}
          stats={stats}
          students={students}
          expenses={expenses}
        />
      )}
    </div>
  );
}

/* Bingkai halaman untuk status loading/error agar konsisten */
function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 text-foreground">
      <a href="/" className="flex items-center gap-2 text-base font-extrabold"><span className="glass-button glass-button-primary size-11"><Wallet className="size-5" /></span>Saku<span className="-ml-2 text-primary">Kelas</span></a>
      <div className="glass-panel flex w-full max-w-lg justify-center p-7 sm:p-10">{children}</div>
      <p className="text-[11px] text-muted-foreground">Kas kita, terbuka untuk semua.</p>
    </div>
  );
}
