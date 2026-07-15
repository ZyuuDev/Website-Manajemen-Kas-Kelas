// Tipe data bersama untuk portal siswa SakuKelas

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
}

export interface StudentStats {
  id: string;
  name: string;
  nis: string;
  classId: string;
  totalPaid: number;
  payments: PaymentRecord[];
  debt: number;
  debtWeeks: number;
  isLunas: boolean;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  receiptUrl: string;
}

export interface MiscIncomeRecord {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface SpecialCollectionInfo {
  id: string;
  name: string;
  amount: number;
  description?: string;
  createdAt: string;
  payments: { studentId: string }[];
  paidIds: string[];
}

export interface ClassInfo {
  id: string;
  name: string;
  slug: string;
  weeklyAmount: number;
  semesterStartDate: string;
  academicYear: string;
  qrisUrl?: string | null;
}

export interface CashFlowWeek {
  name: string;
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardStats {
  elapsedWeeks: number;
  totalIncome: number;
  totalExpense: number;
  liveBalance: number;
  totalDebt: number;
  students: StudentStats[];
  miscIncomes: MiscIncomeRecord[];
}
