import { Vitals } from '../types';

export type RootStackParamList = {
  DoctorTabs: undefined;
  PatientTabs: undefined;
  PatientFile: { patientId: string };
  Visit: { patientId: string; appointmentId?: string };
  Prescription: {
    patientId: string;
    visitId?: string;
    diagnosis?: string;
  };
  VisitDetails: { visitId: string };
  ClinicDetails: { clinicId: string };
  Booking: { clinicId: string };
};

export type DoctorTabsParamList = {
  Dashboard: undefined;
  DoctorAppointments: undefined;
  Patients: undefined;
  FollowUps: undefined;
};

export type PatientTabsParamList = {
  Home: undefined;
  MyAppointments: undefined;
  MyPrescriptions: undefined;
};

export type VisitDraft = {
  complaint: string;
  examNotes: string;
  diagnosis: string;
  vitals: Vitals;
};
