/** نماذج البيانات الأساسية للتطبيق */

export type UserRole = 'doctor' | 'patient';

export interface Specialty {
  id: string;
  name: string;
  icon: string; // اسم أيقونة Ionicons
}

export interface Clinic {
  id: string;
  name: string;
  specialtyId: string;
  address: string;
  phone: string;
  rating: number;
  workingHours: string;
  /** مواعيد العمل المتاحة للحجز (ساعات اليوم) */
  slots: string[];
}

export interface Doctor {
  id: string;
  name: string;
  clinicId: string;
  title: string;
}

export interface Vitals {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  birthDate: string; // ISO
  gender: 'male' | 'female';
  bloodType?: string;
  allergies: string[];
  chronicDiseases: string[];
  notes?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clinicId: string;
  doctorId: string;
  patientId: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  /** معرف إشعار التذكير المجدول إن وجد */
  reminderIds?: string[];
}

export interface Visit {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO datetime
  complaint: string;
  examNotes: string;
  diagnosis: string;
  vitals: Vitals;
  /** ملخص الكشف المُولَّد بالذكاء الاصطناعي */
  aiSummary?: string;
}

export interface PrescriptionItem {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  visitId?: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  instructions?: string;
}

export interface FollowUpTask {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  dueDate: string; // ISO date
  done: boolean;
  notes?: string;
}
