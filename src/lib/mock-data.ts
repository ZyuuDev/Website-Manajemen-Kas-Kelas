export interface ClassDetail {
  id: string;
  name: string;
  slug: string;
  weeklyAmount: number;
  semesterStartDate: string;
  academicYear: string;
  semester: number;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
  totalPaid: number;
  payments: PaymentRecord[];
}

export interface ExpenseRecord {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category: "Peralatan" | "Kegiatan" | "Sosial" | "Lainnya";
  receiptUrl: string; // URL path to receipt image
}

// Helpers to generate dynamic dates relative to today
const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

// Start date of the semester is set to 12 weeks ago (84 days)
export const mockClass: ClassDetail = {
  id: "class_01",
  name: "XII IPA 1",
  slug: "xii-ipa-1",
  weeklyAmount: 10000,
  semesterStartDate: getPastDate(84),
  academicYear: "2025/2026",
  semester: 2,
};

// Generate payments for a student
const generatePayments = (
  studentId: string,
  totalAmount: number,
  weeklyAmount: number,
  startDaysAgo: number
): PaymentRecord[] => {
  const payments: PaymentRecord[] = [];
  const count = Math.ceil(totalAmount / weeklyAmount);
  let remaining = totalAmount;

  for (let i = 0; i < count; i++) {
    const payAmount = Math.min(weeklyAmount, remaining);
    if (payAmount <= 0) break;

    payments.push({
      id: `pay_${studentId}_${i}`,
      studentId,
      amount: payAmount,
      // Spread the payments out every 7 days from start
      date: getPastDate(startDaysAgo - i * 7),
    });

    remaining -= payAmount;
  }

  // If there's still money paid in advance
  if (remaining > 0) {
    payments.push({
      id: `pay_${studentId}_adv`,
      studentId,
      amount: remaining,
      date: getPastDate(1),
    });
  }

  return payments;
};

// List of students with payments
export const mockStudents: Student[] = [
  {
    id: "std_1",
    name: "Adit Pratama",
    nis: "220101",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_2",
    name: "Budi Santoso",
    nis: "220102",
    classId: "class_01",
    totalPaid: 110000,
    payments: []
  },
  {
    id: "std_3",
    name: "Citra Lestari",
    nis: "220103",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_4",
    name: "Dewi Ayu Puspita",
    nis: "220104",
    classId: "class_01",
    totalPaid: 60000,
    payments: []
  },
  {
    id: "std_5",
    name: "Eko Prasetyo",
    nis: "220105",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_6",
    name: "Farhan Ali",
    nis: "220106",
    classId: "class_01",
    totalPaid: 140000, // Paid more!
    payments: []
  },
  {
    id: "std_7",
    name: "Gita Permatasari",
    nis: "220107",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_8",
    name: "Hendra Wijaya",
    nis: "220108",
    classId: "class_01",
    totalPaid: 90000,
    payments: []
  },
  {
    id: "std_9",
    name: "Indah Sari",
    nis: "220109",
    classId: "class_01",
    totalPaid: 0, // No payment at all
    payments: []
  },
  {
    id: "std_10",
    name: "Joko Susilo",
    nis: "220110",
    classId: "class_01",
    totalPaid: 50000,
    payments: []
  },
  {
    id: "std_11",
    name: "Kartika Putri",
    nis: "220111",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_12",
    name: "Lucky Pratama",
    nis: "220112",
    classId: "class_01",
    totalPaid: 120000,
    payments: []
  },
  {
    id: "std_13",
    name: "Mega Utami",
    nis: "220113",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  },
  {
    id: "std_14",
    name: "Naufal Hadi",
    nis: "220114",
    classId: "class_01",
    totalPaid: 80000,
    payments: []
  },
  {
    id: "std_15",
    name: "Olivia Tan",
    nis: "220115",
    classId: "class_01",
    totalPaid: 130000,
    payments: []
  }
];

// Populate the payment lists dynamically for consistency
mockStudents.forEach((std) => {
  std.payments = generatePayments(std.id, std.totalPaid, mockClass.weeklyAmount, 80);
});

// Mock expenses with receipt mock URLs
export const mockExpenses: ExpenseRecord[] = [
  {
    id: "exp_1",
    title: "Beli Sapu & Pengki",
    description: "Pembelian 2 sapu lantai dan 1 pengki untuk kebersihan kelas.",
    amount: 35000,
    date: getPastDate(75),
    category: "Peralatan",
    receiptUrl: "/receipt_sapu.jpg",
  },
  {
    id: "exp_2",
    title: "Beli Spidol & Penghapus Papan",
    description: "Membeli spidol hitam 2 pcs, spidol biru 1 pc, dan 1 penghapus foam.",
    amount: 25000,
    date: getPastDate(61),
    category: "Peralatan",
    receiptUrl: "/receipt_spidol.jpg",
  },
  {
    id: "exp_3",
    title: "Sumbangan Teman Sakit (Eko)",
    description: "Uang santunan dari kas kelas untuk Eko yang dirawat di rumah sakit.",
    amount: 100000,
    date: getPastDate(45),
    category: "Sosial",
    receiptUrl: "/receipt_santunan.jpg",
  },
  {
    id: "exp_4",
    title: "Print & Fotocopy Tugas Kelompok",
    description: "Biaya fotocopy modul fisika dan print laporan PKN untuk 3 kelompok.",
    amount: 45000,
    date: getPastDate(30),
    category: "Kegiatan",
    receiptUrl: "/receipt_fotocopy.jpg",
  },
  {
    id: "exp_5",
    title: "Konsumsi Rapat Kelas",
    description: "Membeli snack box dan air mineral gelas untuk rapat evaluasi semester.",
    amount: 75000,
    date: getPastDate(15),
    category: "Kegiatan",
    receiptUrl: "/receipt_konsumsi.jpg",
  },
  {
    id: "exp_6",
    title: "Beli Gorden Kelas Baru",
    description: "Membeli kain gorden warna abu-abu untuk jendela samping kelas agar tidak silau.",
    amount: 150000,
    date: getPastDate(3),
    category: "Peralatan",
    receiptUrl: "/receipt_gorden.jpg",
  },
];

// Helper to format currency to Indonesian Rupiah
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Calculate the number of weeks elapsed from start date
export function calculateWeeksElapsed(startDateStr: string): number {
  const start = new Date(startDateStr);
  const today = new Date();
  
  // Set to midnight for date-only comparison
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (today < start) return 0;

  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Week elapsed starts from 1 on start_date
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

// Calculate debt based on formula:
// (Elapsed Weeks * Weekly Cash) - Total Paid = Debt
// If paid is greater than expected, debt is 0
export function getStudentDebt(student: Student, weeklyAmount: number, elapsedWeeks: number): number {
  const expectedAmount = elapsedWeeks * weeklyAmount;
  const debt = expectedAmount - student.totalPaid;
  return debt > 0 ? debt : 0;
}

// Get statistics for the dashboard
export function getDashboardStats() {
  const elapsedWeeks = calculateWeeksElapsed(mockClass.semesterStartDate);
  
  // Total money collected
  const totalIncome = mockStudents.reduce((sum, std) => sum + std.totalPaid, 0);
  
  // Total money spent
  const totalExpense = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Live balance
  const liveBalance = totalIncome - totalExpense;

  // Debts
  const totalDebt = mockStudents.reduce((sum, std) => {
    return sum + getStudentDebt(std, mockClass.weeklyAmount, elapsedWeeks);
  }, 0);

  // Status mapping
  const studentStats = mockStudents.map(std => {
    const debt = getStudentDebt(std, mockClass.weeklyAmount, elapsedWeeks);
    const expected = elapsedWeeks * mockClass.weeklyAmount;
    const isLunas = std.totalPaid >= expected;
    const debtWeeks = Math.max(0, Math.ceil(debt / mockClass.weeklyAmount));
    
    return {
      ...std,
      debt,
      debtWeeks,
      isLunas,
    };
  });

  return {
    elapsedWeeks,
    totalIncome,
    totalExpense,
    liveBalance,
    totalDebt,
    students: studentStats,
  };
}

// Get cash flow history grouped by week
export function getCashFlowHistory() {
  const start = new Date(mockClass.semesterStartDate);
  start.setHours(0, 0, 0, 0);

  const elapsedWeeks = calculateWeeksElapsed(mockClass.semesterStartDate);
  
  const weeksData = Array.from({ length: elapsedWeeks }, (_, i) => ({
    name: `Minggu ${i + 1}`,
    income: 0,
    expense: 0,
    balance: 0,
  }));

  // Group payments
  mockStudents.forEach((std) => {
    std.payments.forEach((p) => {
      const pDate = new Date(p.date);
      pDate.setHours(0, 0, 0, 0);
      const diffTime = pDate.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = Math.max(0, Math.floor(diffDays / 7));
      if (weekIndex < elapsedWeeks) {
        weeksData[weekIndex].income += p.amount;
      }
    });
  });

  // Group expenses
  mockExpenses.forEach((exp) => {
    const eDate = new Date(exp.date);
    eDate.setHours(0, 0, 0, 0);
    const diffTime = eDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.max(0, Math.floor(diffDays / 7));
    if (weekIndex < elapsedWeeks) {
      weeksData[weekIndex].expense += exp.amount;
    }
  });

  // Calculate cumulative balance
  let runningBalance = 0;
  for (let i = 0; i < elapsedWeeks; i++) {
    runningBalance += weeksData[i].income - weeksData[i].expense;
    weeksData[i].balance = runningBalance;
  }

  return weeksData;
}

