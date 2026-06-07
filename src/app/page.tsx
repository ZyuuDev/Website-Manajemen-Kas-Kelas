"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  Zap,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    color: "emerald",
    title: "Laporan Real-Time",
    desc: "Grafik arus kas diperbarui otomatis setiap kali bendahara mencatat transaksi.",
  },
  {
    icon: Shield,
    color: "teal",
    title: "Transparan & Aman",
    desc: "Data dienkripsi di Supabase. Portal ini hanya bisa dibaca (read-only) oleh siswa.",
  },
  {
    icon: Users,
    color: "amber",
    title: "Self-Check Mandiri",
    desc: "Siswa bisa cek status kas & riwayat pembayaran sendiri tanpa bantuan bendahara.",
  },
  {
    icon: Zap,
    color: "rose",
    title: "Sinkronisasi Instan",
    desc: "Terhubung langsung dengan Aplikasi Bendahara. Data selalu sinkron dan up-to-date.",
  },
];

const steps = [
  { step: "01", text: "Dapatkan kode kelas dari bendahara" },
  { step: "02", text: "Masukkan kode di kotak pencarian" },
  { step: "03", text: "Lihat dashboard kas kelas Anda" },
];

const colorMap: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  teal:    "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
  amber:   "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  rose:    "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
};

export default function Home() {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError("Silakan masukkan kode kelas terlebih dahulu.");
      return;
    }
    const slug = classCode
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      setError("Format kode kelas tidak valid.");
      return;
    }
    router.push(`/c/${slug}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
              linear-gradient(to right, rgba(16,185,129,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-600 shadow-lg shadow-primary/25">
              <Wallet className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Saku<span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">Kelas</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Live · Data Real-Time</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Portal Transparansi Kas Kelas
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
            Kas Kelas{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Transparan
            </span>
            <br />
            <span className="text-slate-300">& Mudah Dipantau</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg leading-relaxed">
            Pantau saldo, arus kas, dan status pembayaran iuran kelas secara{" "}
            <span className="text-slate-200 font-medium">real-time</span>. Tidak perlu login — cukup masukkan kode kelas Anda.
          </p>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-10 w-full max-w-lg"
          >
            <div className="rounded-2xl border border-border bg-card/75 p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
              <p className="mb-4 text-sm font-semibold text-slate-300">
                Masukkan Kode Kelas Anda
              </p>
              <form onSubmit={handleEnter} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    id="class-code-input"
                    type="text"
                    placeholder="Contoh: xii-ipa-1"
                    value={classCode}
                    onChange={(e) => {
                      setClassCode(e.target.value);
                      if (error) setError("");
                    }}
                    className="h-12 w-full rounded-xl border border-border bg-[#050810] px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-emerald-500 hover:to-primary hover:shadow-primary/30 active:scale-[0.97]"
                >
                  Masuk
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {error && (
                <p className="mt-2 text-xs text-destructive font-medium">{error}</p>
              )}
              <p className="mt-3 text-xs text-slate-600">
                💡 Bisa ketik langsung nama kelas seperti{" "}
                <span className="text-slate-500 italic">"XII IPA 1"</span>
              </p>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8"
          >
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  {s.step}
                </span>
                {s.text}
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden h-4 w-4 sm:block text-slate-700" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Kenapa Pakai SakuKelas?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Semua yang Anda butuhkan untuk transparansi kas kelas
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              const cls = colorMap[feat.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`rounded-2xl border bg-gradient-to-br p-5 transition-shadow hover:shadow-xl ${cls}`}
                >
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cls}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{feat.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600"
          >
            {["Data enkripsi end-to-end", "Tidak perlu login akun", "Otomatis sinkron dari app", "Gratis untuk semua kelas"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500/60" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-700 space-y-1">
          <p>© 2026 SakuKelas Portal. Portal ini bersifat read-only untuk keamanan data.</p>
          <p>Pencatatan kas hanya dapat dilakukan melalui Aplikasi Mobile Bendahara.</p>
        </div>
      </footer>
    </div>
  );
}
