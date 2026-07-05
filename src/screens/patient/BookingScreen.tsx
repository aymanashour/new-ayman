import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, EmptyState, Field, SectionTitle } from '../../components/ui';
import { clinics, doctors } from '../../data/seed';
import { RootStackParamList } from '../../navigation/types';
import { scheduleAppointmentReminders } from '../../services/notifications';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr, formatTimeAr, isFutureAppointment, nextDays } from '../../utils/dates';

/** شاشة الحجز: اختيار اليوم والساعة وسبب الزيارة، مع جدولة تذكيرات تلقائية */
export default function BookingScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Booking'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clinicId } = route.params;

  const { currentPatientId, appointments, bookAppointment, setAppointmentReminders } = useStore();
  const clinic = clinics.find((c) => c.id === clinicId);
  const doctor = doctors.find((d) => d.clinicId === clinicId);

  const days = nextDays(7);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!clinic || !doctor) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على العيادة" />;
  }

  /** المواعيد المحجوزة بالفعل في اليوم المختار */
  const takenSlots = new Set(
    appointments
      .filter((a) => a.clinicId === clinicId && a.date === selectedDate && a.status !== 'cancelled')
      .map((a) => a.time),
  );

  const availableSlots = clinic.slots.filter(
    (slot) => !takenSlots.has(slot) && isFutureAppointment(selectedDate, slot),
  );

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert('تنبيه', 'اختر ساعة الموعد');
      return;
    }
    setSaving(true);
    try {
      const appointment = bookAppointment({
        clinicId,
        doctorId: doctor.id,
        patientId: currentPatientId,
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim() || 'كشف عام',
      });
      const reminderIds = await scheduleAppointmentReminders(appointment, clinic);
      if (reminderIds.length) setAppointmentReminders(appointment.id, reminderIds);

      Alert.alert(
        'تم الحجز ✅',
        `موعدك ${formatDateAr(selectedDate)} الساعة ${formatTimeAr(selectedTime)} في ${clinic.name}.\n${
          reminderIds.length ? 'سيصلك تذكير قبل الموعد.' : 'فعّل الإشعارات ليصلك تذكير بالموعد.'
        }`,
        [{ text: 'حسناً', onPress: () => navigation.popToTop() }],
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={typography.caption}>{doctor.name} — {doctor.title}</Text>
        </Card>

        <SectionTitle title="اختر اليوم" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View style={styles.daysRow}>
            {days.map((day) => {
              const active = selectedDate === day;
              const d = new Date(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCard, active && styles.dayActive]}
                  onPress={() => {
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                >
                  <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.getDate()}</Text>
                  <Text style={[styles.dayName, active && styles.dayTextActive]}>
                    {formatDateAr(day).split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <SectionTitle title="اختر الساعة" />
        {availableSlots.length === 0 ? (
          <EmptyState icon="time-outline" message="لا توجد مواعيد متاحة في هذا اليوم — جرّب يوماً آخر" />
        ) : (
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot) => {
              const active = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slot, active && styles.slotActive]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.slotText, active && styles.slotTextActive]}>
                    {formatTimeAr(slot)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <SectionTitle title="سبب الزيارة" />
        <Field
          label=""
          placeholder="صف شكواك باختصار (اختياري)"
          value={reason}
          onChangeText={setReason}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selectedTime ? `تأكيد الحجز — ${formatTimeAr(selectedTime)}` : 'اختر موعداً'}
          icon="checkmark-circle"
          onPress={handleBook}
          loading={saving}
          disabled={!selectedTime}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  clinicName: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, textAlign: 'right' },
  daysRow: { flexDirection: 'row-reverse', gap: spacing.sm },
  dayCard: {
    width: 64,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  dayName: { fontSize: 12, color: colors.textSecondary },
  dayTextActive: { color: '#fff' },
  slotsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 14, fontWeight: '600', color: colors.text },
  slotTextActive: { color: '#fff' },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
