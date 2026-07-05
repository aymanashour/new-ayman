import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, EmptyState, StatusBadge } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr, formatTimeAr, todayISO } from '../../utils/dates';

type Filter = 'today' | 'upcoming' | 'past';

export default function DoctorAppointments() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentDoctorId, appointments, patients, updateAppointmentStatus } = useStore();
  const [filter, setFilter] = useState<Filter>('today');

  const today = todayISO();
  const mine = appointments.filter((a) => a.doctorId === currentDoctorId);

  const filtered = mine
    .filter((a) => {
      if (filter === 'today') return a.date === today;
      if (filter === 'upcoming') return a.date > today;
      return a.date < today || a.status === 'completed';
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const filters: { key: Filter; label: string }[] = [
    { key: 'today', label: 'اليوم' },
    { key: 'upcoming', label: 'القادمة' },
    { key: 'past', label: 'السابقة' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {filtered.length === 0 ? (
          <EmptyState icon="calendar-outline" message="لا توجد مواعيد في هذه الفئة" />
        ) : (
          filtered.map((appointment) => {
            const patient = patients.find((p) => p.id === appointment.patientId);
            const actionable = appointment.status === 'pending' || appointment.status === 'confirmed';
            return (
              <Card key={appointment.id}>
                <View style={styles.row}>
                  <Avatar name={patient?.name ?? '؟'} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{patient?.name}</Text>
                    <Text style={typography.caption}>{appointment.reason}</Text>
                    <Text style={typography.caption}>
                      {formatDateAr(appointment.date)} — {formatTimeAr(appointment.time)}
                    </Text>
                  </View>
                  <StatusBadge status={appointment.status} />
                </View>

                {actionable && (
                  <View style={styles.actions}>
                    {appointment.status === 'pending' && (
                      <Button
                        title="تأكيد"
                        icon="checkmark"
                        style={styles.actionBtn}
                        onPress={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      />
                    )}
                    <Button
                      title="بدء الكشف"
                      icon="clipboard-outline"
                      variant="outline"
                      style={styles.actionBtn}
                      onPress={() =>
                        navigation.navigate('Visit', {
                          patientId: appointment.patientId,
                          appointmentId: appointment.id,
                        })
                      }
                    />
                    <Button
                      title="إلغاء"
                      variant="danger"
                      style={styles.actionBtn}
                      onPress={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                    />
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: 0,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 8 },
});
