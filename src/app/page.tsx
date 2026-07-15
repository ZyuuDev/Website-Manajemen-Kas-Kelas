import { ClassDashboard } from "@/components/ClassDashboard";

// Mode 1 kelas: halaman utama langsung menampilkan dashboard kelas
// (pakai NEXT_PUBLIC_DEFAULT_CLASS_SLUG bila di-set, jika tidak kelas pertama).
export default function Home() {
  return <ClassDashboard />;
}
