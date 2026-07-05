import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, EmptyState, Field, SectionTitle } from '../../components/ui';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr, todayISO } from '../../utils/dates';

/** شاشة متابعة المرضى: مهام متابعة لكل مريض مع إمكانية الإضافة والإنجاز */
export default function FollowUpsScreen() {
  const { currentDoctorId, followUps, patients, toggleFollowUp, addFollowUp } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [daysAhead, setDaysAhead] = useState('7');

  const mine = followUps.filter((f) => f.doctorId === currentDoctorId);
  const pending = mine.filter((f) => !f.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = mine.filter((f) => f.done);
  const today = todayISO();

  const handleAdd = () => {
    if (!title.trim() || !selectedPatientId) {
      Alert.alert('تنبيه', 'أدخل عنوان المتابعة واختر المريض');
      return;
    }
    const due = new Date();
    due.setDate(due.getDate() + (parseInt(daysAhead, 10) || 7));
    addFollowUp({
      patientId: selectedPatientId,
      doctorId: currentDoctorId,
      title: title.trim(),
      dueDate: due.toISOString().slice(0, 10),
    });
    setTitle('');
    setSelectedPatientId(null);
    setShowForm(false);
  };

  const renderTask = (taskId: string) => {
    const task = mine.find((f) => f.id === taskId);
    if (!task) return null;
    const patient = patients.find((p) => p.id === task.patientId);
    const overdue = !task.done && task.dueDate < today;
    return (
      <Card key={task.id}>
        <TouchableOpacity style={styles.taskRow} onPress={() => toggleFollowUp(task.id)} activeOpacity={0.7}>
          <Ionicons
            name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={task.done ? colors.success : colors.border}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
            <Text style={typography.caption}>
              {patient?.name} — الاستحقاق: {formatDateAr(task.dueDate)}
            </Text>
            {task.notes ? <Text style={typography.caption}>{task.notes}</Text> : null}
          </View>
          {overdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>متأخرة</Text>
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Button
        title={showForm ? 'إخفاء النموذج' : 'إضافة مهمة متابعة'}
        icon={showForm ? 'chevron-up' : 'add-circle-outline'}
        variant="outline"
        onPress={() => setShowForm(!showForm)}
      />

      {showForm && (
        <Card style={{ marginTop: spacing.sm }}>
          <Field label="عنوان المتابعة" placeholder="مثال: مراجعة نتائج التحاليل" value={title} onChangeText={setTitle} />
          <Text style={styles.pickLabel}>اختر المريض:</Text>
          <View style={styles.patientChips}>
            {patients.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, selectedPatientId === p.id && styles.chipActive]}
                onPress={() => setSelectedPatientId(p.id)}
              >
                <Text style={[styles.chipText, selectedPatientId === p.id && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="بعد كم يوم؟" placeholder="7" value={daysAhead} onChangeText={setDaysAhead} keyboardType="numeric" />
          <Button title="حفظ المهمة" icon="save-outline" onPress={handleAdd} />
        </Card>
      )}

      <SectionTitle title={`قيد المتابعة (${pending.length})`} />
      {pending.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" message="لا توجد متابعات معلقة" />
      ) : (
        pending.map((t) => renderTask(t.id))
      )}

      {done.length > 0 && (
        <>
          <SectionTitle title={`مكتملة (${done.length})`} />
          {done.map((t) => renderTask(t.id))}
        </>
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  taskRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  taskDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  overdueBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  overdueText: { fontSize: 11, fontWeight: '700', color: colors.danger },
  pickLabel: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'right', marginBottom: 8 },
  patientChips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
});
