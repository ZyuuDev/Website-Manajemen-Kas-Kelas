import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SakuKelas — Portal Transparansi Kas Kelas",
  description: "Pantau uang kas kelas secara real-time dan transparan.",
};

// Dijalankan sebelum halaman dirender agar tidak terjadi kedipan tema (FOUC).
// Prioritas: ?theme=dark|light → pilihan tersimpan → preferensi perangkat.
const themeInitScript = `(function(){try{var q=new URLSearchParams(location.search).get("theme");var t=q||localStorage.getItem("sakukelas-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var c=document.documentElement.classList;d?c.add("dark"):c.remove("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-screen font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
