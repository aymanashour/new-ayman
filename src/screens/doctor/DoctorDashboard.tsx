import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, EmptyState, SectionTitle, StatusBadge } from '../../components/ui';
import { clinics, doctors } from '../../data/seed';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatTimeAr, todayISO } from '../../utils/dates';

export default function DoctorDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentDoctorId, appointments, patients, followUps } = useStore();

  const doctor = doctors.find((d) => d.id === currentDoctorId);
  const clinic = clinics.find((c) => c.id === doctor?.clinicId);
  const today = todayISO();

  const todayAppointments = appointments
    .filter((a) => a.doctorId === currentDoctorId && a.date === today && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  const pendingFollowUps = followUps.filter((f) => f.doctorId === currentDoctorId && !f.done);

  const stats = [
    { label: 'مواعيد اليوم', value: todayAppointments.length, icon: 'calendar' as const, color: colors.primary },
    { label: 'مرضى مسجلون', value: patients.length, icon: 'people' as const, color: colors.info },
    { label: 'متابعات معلقة', value: pendingFollowUps.length, icon: 'notifications' as const, color: colors.accent },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.header}>
        <Avatar name={doctor?.name ?? ''} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={typography.subtitle}>مرحباً، {doctor?.name}</Text>
          <Text style={typography.caption}>{clinic?.name} — {doctor?.title}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon} size={22} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="مواعيد اليوم" />
      {todayAppointments.length === 0 ? (
        <EmptyState icon="calendar-outline" message="لا توجد مواعيد لليوم" />
      ) : (
        todayAppointments.map((appointment) => {
          const patient = patients.find((p) => p.id === appointment.patientId);
          return (
            <TouchableOpacity
              key={appointment.id}
              onPress={() => patient && navigation.navigate('PatientFile', { patientId: patient.id })}
              activeOpacity={0.7}
            >
              <Card>
                <View style={styles.appointmentRow}>
                  <Avatar name={patient?.name ?? '؟'} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{patient?.name}</Text>
                    <Text style={typography.caption}>{appointment.reason}</Text>
                  </View>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={styles.time}>{formatTimeAr(appointment.time)}</Text>
                    <StatusBadge status={appointment.status} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      <SectionTitle title="متابعات تحتاج انتباهك" />
      {pendingFollowUps.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" message="لا توجد متابعات معلقة" />
      ) : (
        pendingFollowUps.slice(0, 3).map((task) => {
          const patient = patients.find((p) => p.id === task.patientId);
          return (
            <Card key={task.id}>
              <Text style={styles.patientName}>{task.title}</Text>
              <Text style={typography.caption}>المريض: {patient?.name}</Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  appointmentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  patientName: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  time: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
