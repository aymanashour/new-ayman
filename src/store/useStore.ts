import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as seed from '../data/seed';
import {
  Appointment, AppointmentStatus, FollowUpTask, Patient, Prescription,
  UserRole, Visit,
} from '../types';
import { generateId } from '../utils/dates';

interface AppState {
  role: UserRole | null;
  /** المستخدم الحالي: معرف الطبيب أو المريض حسب الدور */
  currentDoctorId: string;
  currentPatientId: string;

  patients: Patient[];
  appointments: Appointment[];
  visits: Visit[];
  prescriptions: Prescription[];
  followUps: FollowUpTask[];

  setRole: (role: UserRole | null) => void;

  bookAppointment: (input: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  setAppointmentReminders: (id: string, reminderIds: string[]) => void;

  addPatient: (input: Omit<Patient, 'id'>) => Patient;
  updatePatient: (id: string, patch: Partial<Patient>) => void;

  addVisit: (input: Omit<Visit, 'id'>) => Visit;
  setVisitSummary: (visitId: string, summary: string) => void;

  addPrescription: (input: Omit<Prescription, 'id'>) => Prescription;

  addFollowUp: (input: Omit<FollowUpTask, 'id' | 'done'>) => void;
  toggleFollowUp: (id: string) => void;

  resetDemoData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: null,
      currentDoctorId: 'dr_1',
      currentPatientId: 'pt_1',

      patients: seed.patients,
      appointments: seed.appointments,
      visits: seed.visits,
      prescriptions: seed.prescriptions,
      followUps: seed.followUps,

      setRole: (role) => set({ role }),

      bookAppointment: (input) => {
        const appointment: Appointment = {
          ...input,
          id: generateId('ap'),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ appointments: [...s.appointments, appointment] }));
        return appointment;
      },

      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      setAppointmentReminders: (id, reminderIds) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, reminderIds } : a)),
        })),

      addPatient: (input) => {
        const patient: Patient = { ...input, id: generateId('pt') };
        set((s) => ({ patients: [...s.patients, patient] }));
        return patient;
      },

      updatePatient: (id, patch) =>
        set((s) => ({
          patients: s.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      addVisit: (input) => {
        const visit: Visit = { ...input, id: generateId('vs') };
        set((s) => ({ visits: [...s.visits, visit] }));
        return visit;
      },

      setVisitSummary: (visitId, summary) =>
        set((s) => ({
          visits: s.visits.map((v) => (v.id === visitId ? { ...v, aiSummary: summary } : v)),
        })),

      addPrescription: (input) => {
        const prescription: Prescription = { ...input, id: generateId('rx') };
        set((s) => ({ prescriptions: [...s.prescriptions, prescription] }));
        return prescription;
      },

      addFollowUp: (input) =>
        set((s) => ({
          followUps: [...s.followUps, { ...input, id: generateId('fu'), done: false }],
        })),

      toggleFollowUp: (id) =>
        set((s) => ({
          followUps: s.followUps.map((f) => (f.id === id ? { ...f, done: !f.done } : f)),
        })),

      resetDemoData: () =>
        set({
          patients: seed.patients,
          appointments: seed.appointments,
          visits: seed.visits,
          prescriptions: seed.prescriptions,
          followUps: seed.followUps,
        }),
    }),
    {
      name: 'ai-clinic-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
