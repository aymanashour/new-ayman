import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, SectionTitle, StatusBadge } from '../../components/ui';
import { clinics, doctors } from '../../data/seed';
import { cancelReminders } from '../../services/notifications';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr, formatTimeAr, todayISO } from '../../utils/dates';

/** مواعيد المريض: القادمة والسابقة مع إمكانية الإلغاء */
export default function MyAppointments() {
  const { currentPatientId, appointments, updateAppointmentStatus } = useStore();
  const today = todayISO();

  const mine = appointments
    .filter((a) => a.patientId === currentPatientId)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const upcoming = mine.filter(
    (a) => a.date >= today && (a.status === 'pending' || a.status === 'confirmed'),
  );
  const past = mine.filter((a) => !upcoming.includes(a));

  const handleCancel = (id: string) => {
    Alert.alert('إلغاء الموعد', 'هل أنت متأكد من إلغاء هذا الموعد؟', [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'إلغاء الموعد',
        style: 'destructive',
        onPress: async () => {
          const appointment = mine.find((a) => a.id === id);
          await cancelReminders(appointment?.reminderIds);
          updateAppointmentStatus(id, 'cancelled');
        },
      },
    ]);
  };

  const renderAppointment = (id: string, cancellable: boolean) => {
    const appointment = mine.find((a) => a.id === id);
    if (!appointment) return null;
    const clinic = clinics.find((c) => c.id === appointment.clinicId);
    const doctor = doctors.find((d) => d.id === appointment.doctorId);
    return (
      <Card key={appointment.id}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clinicName}>{clinic?.name}</Text>
            <Text style={typography.caption}>{doctor?.name}</Text>
            <Text style={typography.caption}>
              {formatDateAr(appointment.date)} — {formatTimeAr(appointment.time)}
            </Text>
            <Text style={typography.caption}>السبب: {appointment.reason}</Text>
          </View>
          <StatusBadge status={appointment.status} />
        </View>
        {cancellable && (
          <Button
            title="إلغاء الموعد"
            variant="danger"
            style={styles.cancelBtn}
            onPress={() => handleCancel(appointment.id)}
          />
        )}
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <SectionTitle title={`المواعيد القادمة (${upcoming.length})`} />
      {upcoming.length === 0 ? (
        <EmptyState icon="calendar-outline" message="لا توجد مواعيد قادمة — احجز من الرئيسية" />
      ) : (
        upcoming.map((a) => renderAppointment(a.id, true))
      )}

      <SectionTitle title={`السجل (${past.length})`} />
      {past.length === 0 ? (
        <EmptyState icon="time-outline" message="لا يوجد سجل مواعيد" />
      ) : (
        past.map((a) => renderAppointment(a.id, false))
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.md },
  clinicName: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  cancelBtn: { marginTop: spacing.sm, paddingVertical: 10 },
});
