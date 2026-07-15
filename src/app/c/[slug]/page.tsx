"use client";

import { useParams } from "next/navigation";
import { ClassDashboard } from "@/components/ClassDashboard";

// Fallback multi-kelas: /c/[slug] tetap tersedia bila suatu saat
// portal dipakai lebih dari satu kelas.
export default function ClassPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return <ClassDashboard slug={slug} />;
}
