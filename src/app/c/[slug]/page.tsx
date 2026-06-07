"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  School,
  Calendar,
  RefreshCw,
  AlertCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Receipt,
} from "lucide-react";
import { calculateWeeksElapsed } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BalanceCard } from "@/components/BalanceCard";
import { CashFlowChart } from "@/components/CashFlowChart";
import { WallOfShame } from "@/components/WallOfShame";
import { StudentSearch } from "@/components/StudentSearch";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;

    async function loadData() {
      try {
        setLoading(true);
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("slug", slug.toLowerCase())
          .single();

        if (classError || !classData) {
          console.error("Supabase Class Fetch Error:", classError);
          // Fetch alternative classes suggestions
          const { data: classesList } = await supabase
            .from("classes")
            .select("name, slug");
          setAllClasses(classesList || []);
          setClassInfo(null);
          setLoading(false);
          return;
        }

        const { data: academicData } = await supabase
          .from("academic_years")
          .select("*")
          .eq("class_id", classData.id)
          .eq("is_active", true)
          .single();

        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*, transactions(*)")
          .eq("class_id", classData.id)
          .eq("is_active", true);

        const { data: expensesData, error: expensesError } = await supabase
          .from("transactions")
          .select("*")
          .eq("class_id", classData.id)
          .eq("type", "EXPENSE")
          .order("date", { ascending: false });

        if (studentsError || expensesError) {
          console.error("Database fetch error:", studentsError, expensesError);
          setLoading(false);
          return;
        }

        const elapsedWeeks = calculateWeeksElapsed(classData.semester_start_date);

        const mappedStudents = (studentsData || []).map((std: any) => {
          const payments = (std.transactions || [])
            .filter((tx: any) => tx.type === "INCOME")
            .map((tx: any) => ({
              id: tx.id,
              studentId: tx.student_id,
              amount: tx.amount,
              date: tx.date,
            }));

          const totalPaid = payments.reduce(
            (sum: number, p: any) => sum + p.amount,
            0
          );
          const expectedAmount = elapsedWeeks * classData.weekly_fee;
          const debt = expectedAmount - totalPaid > 0 ? expectedAmount - totalPaid : 0;
          const isLunas = totalPaid >= expectedAmount;
          const debtWeeks = Math.max(0, Math.ceil(debt / classData.weekly_fee));

          return {
            id: std.id,
            name: std.name,
            nis: std.nis,
            classId: std.class_id,
            totalPaid,
            payments,
            debt,
            debtWeeks,
            isLunas,
          };
        });

        const mappedExpenses = (expensesData || []).map((exp: any) => {
          let receiptUrl = exp.receipt_url || "";
          if (
            receiptUrl &&
            !receiptUrl.startsWith("http") &&
            !receiptUrl.startsWith("/")
          ) {
            const { data } = supabase.storage.from("receipts").getPublicUrl(receiptUrl);
            receiptUrl = data.publicUrl;
          }
          return {
            id: exp.id,
            title: exp.description,
            description: exp.description,
            amount: exp.amount,
            date: exp.date,
            category: exp.category || "Lainnya",
            receiptUrl,
          };
        });

        const totalIncome = mappedStudents.reduce(
          (sum: number, std: any) => sum + std.totalPaid,
          0
        );
        const totalExpense = mappedExpenses.reduce(
          (sum: number, exp: any) => sum + exp.amount,
          0
        );
        const liveBalance = totalIncome - totalExpense;
        const totalDebt = mappedStudents.reduce(
          (sum: number, std: any) => sum + std.debt,
          0
        );

        const start = new Date(classData.semester_start_date);
        start.setHours(0, 0, 0, 0);

        const weeksData = Array.from({ length: Math.max(1, elapsedWeeks) }, (_, i) => ({
          name: `Minggu ${i + 1}`,
          income: 0,
          expense: 0,
          balance: 0,
        }));

        mappedStudents.forEach((std: any) => {
          std.payments.forEach((p: any) => {
            const pDate = new Date(p.date);
            pDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor(
              (pDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            const weekIndex = Math.max(0, Math.floor(diffDays / 7));
            if (weekIndex < weeksData.length) {
              weeksData[weekIndex].income += p.amount;
            }
          });
        });

        mappedExpenses.forEach((exp: any) => {
          const eDate = new Date(exp.date);
          eDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor(
            (eDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          const weekIndex = Math.max(0, Math.floor(diffDays / 7));
          if (weekIndex < weeksData.length) {
            weeksData[weekIndex].expense += exp.amount;
          }
        });

        let runningBalance = 0;
        for (let i = 0; i < weeksData.length; i++) {
          runningBalance += weeksData[i].income - weeksData[i].expense;
          weeksData[i].balance = runningBalance;
        }

        setClassInfo({
          id: classData.id,
          name: classData.name,
          slug: classData.slug,
          weeklyAmount: classData.weekly_fee,
          semesterStartDate: classData.semester_start_date,
          academicYear: academicData?.name || "Semester Aktif",
          semester: 1,
        });
        setStudents(mappedStudents);
        setExpenses(mappedExpenses);
        setStats({
          elapsedWeeks,
          totalIncome,
          totalExpense,
          liveBalance,
          totalDebt,
          students: mappedStudents,
        });
        setChartData(weeksData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading Supabase data:", err);
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md -z-10 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-200">Memuat Data Kelas</p>
            <p className="text-xs text-slate-500 mt-1">Sinkronisasi dengan Supabase…</p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Not Found State ── */
  if (!classInfo) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-rose-500/10 blur-[100px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center z-10"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Kelas Tidak Ditemukan</h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Kode kelas{" "}
            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-rose-400">
              &quot;{slug}&quot;
            </span>{" "}
            tidak terdaftar. Pastikan kode kelas yang Anda masukkan benar.
          </p>

          {allClasses.length > 0 && (
            <div className="mt-6 text-left border border-border bg-card/40 backdrop-blur-md rounded-xl p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                Kelas yang Tersedia:
              </p>
              <div className="space-y-1.5">
                {allClasses.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => router.push(`/c/${c.slug}`)}
                    className="flex w-full items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-primary border border-border/40 transition-all text-left"
                  >
                    <span>Kelas {c.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-sm font-semibold text-white transition-all hover:from-slate-700 hover:to-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Background ambiance */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute bottom-1/3 right-0 h-[300px] w-[300px] rounded-full bg-teal-500/5 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow shadow-emerald-500/30">
                <School className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-white sm:text-base">
                  Kelas {classInfo.name}
                </h1>
                <p className="text-[10px] text-slate-500">Portal Keuangan Siswa</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>{classInfo.academicYear}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Live Sync
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* ── Row 1: Balance Cards ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BalanceCard
            liveBalance={stats.liveBalance}
            totalIncome={stats.totalIncome}
            totalExpense={stats.totalExpense}
            totalDebt={stats.totalDebt}
          />
        </motion.section>

        {/* ── Row 2: Chart + Wall of Debt ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <CashFlowChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <WallOfShame
              students={stats.students}
              weeklyAmount={classInfo.weeklyAmount}
            />
          </div>
        </motion.section>

        {/* ── Row 3: Self-Check + Activity Feed ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <StudentSearch
              students={stats.students}
              elapsedWeeks={stats.elapsedWeeks}
              weeklyAmount={classInfo.weeklyAmount}
            />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed students={students} expenses={expenses} />
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-white/5 bg-background/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-600 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 SakuKelas Portal · Data diperbarui secara real-time dari Aplikasi Bendahara.</p>
          <p>Portal ini bersifat Read-Only (Hanya Lihat) demi keamanan data kelas.</p>
        </div>
      </footer>
    </div>
  );
}
