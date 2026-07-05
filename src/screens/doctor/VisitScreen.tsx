import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Button, Card, EmptyState, Field, SectionTitle } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { summarizeVisit } from '../../services/ai';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { ageFromBirthDate } from '../../utils/dates';

/**
 * شاشة الكشف: تسجيل الشكوى والفحص والتشخيص،
 * ثم توليد ملخص الكشف بالذكاء الاصطناعي وحفظه في ملف المريض.
 */
export default function VisitScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Visit'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientId, appointmentId } = route.params;

  const { patients, currentDoctorId, addVisit, updateAppointmentStatus } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  const [complaint, setComplaint] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');

  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  if (!patient) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على المريض" />;
  }

  const vitals = {
    bloodPressure: bloodPressure.trim() || undefined,
    heartRate: heartRate.trim() || undefined,
    temperature: temperature.trim() || undefined,
    weight: weight.trim() || undefined,
  };

  const handleSummarize = async () => {
    if (!complaint.trim() && !examNotes.trim()) {
      Alert.alert('تنبيه', 'أدخل الشكوى أو ملاحظات الفحص أولاً');
      return;
    }
    setSummarizing(true);
    try {
      const summary = await summarizeVisit({ patient, complaint, examNotes, diagnosis, vitals });
      setAiSummary(summary);
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleSave = () => {
    if (!diagnosis.trim()) {
      Alert.alert('تنبيه', 'أدخل التشخيص قبل الحفظ');
      return;
    }
    const visit = addVisit({
      appointmentId,
      patientId,
      doctorId: currentDoctorId,
      date: new Date().toISOString(),
      complaint: complaint.trim(),
      examNotes: examNotes.trim(),
      diagnosis: diagnosis.trim(),
      vitals,
      aiSummary: aiSummary || undefined,
    });
    if (appointmentId) updateAppointmentStatus(appointmentId, 'completed');

    Alert.alert('تم الحفظ', 'هل تريد كتابة وصفة لهذا الكشف؟', [
      { text: 'ليس الآن', style: 'cancel', onPress: () => navigation.goBack() },
      {
        text: 'كتابة وصفة',
        onPress: () =>
          navigation.replace('Prescription', {
            patientId,
            visitId: visit.id,
            diagnosis: diagnosis.trim(),
          }),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
        <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
          <Text style={styles.patientLine}>
            {patient.name} — {ageFromBirthDate(patient.birthDate)} سنة
          </Text>
          {patient.allergies.length > 0 && (
            <Text style={styles.allergyLine}>⚠️ حساسية: {patient.allergies.join('، ')}</Text>
          )}
        </Card>

        <SectionTitle title="بيانات الكشف" />
        <Field
          label="الشكوى الرئيسية"
          placeholder="ما الذي يشكو منه المريض؟"
          value={complaint}
          onChangeText={setComplaint}
          multiline
        />
        <Field
          label="ملاحظات الفحص الإكلينيكي"
          placeholder="نتائج الفحص، الملاحظات السريرية..."
          value={examNotes}
          onChangeText={setExamNotes}
          multiline
        />
        <Field
          label="التشخيص"
          placeholder="التشخيص المبدئي أو النهائي"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />

        <SectionTitle title="العلامات الحيوية" />
        <View style={styles.vitalsRow}>
          <View style={{ flex: 1 }}>
            <Field label="الضغط" placeholder="120/80" value={bloodPressure} onChangeText={setBloodPressure} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="النبض" placeholder="75" value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" />
          </View>
        </View>
        <View style={styles.vitalsRow}>
          <View style={{ flex: 1 }}>
            <Field label="الحرارة" placeholder="37.0" value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="الوزن (كجم)" placeholder="80" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
        </View>

        <Button
          title="توليد ملخص الكشف بالذكاء الاصطناعي"
          icon="sparkles"
          onPress={handleSummarize}
          loading={summarizing}
          variant="outline"
        />

        {aiSummary ? (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
              <Text style={styles.summaryTitle}>ملخص الكشف</Text>
            </View>
            <Text style={styles.summaryText}>{aiSummary}</Text>
            <Text style={typography.caption}>راجع الملخص وعدّل بيانات الكشف ثم أعد التوليد إن لزم</Text>
          </Card>
        ) : null}

        <Button
          title="حفظ الكشف في ملف المريض"
          icon="save-outline"
          onPress={handleSave}
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  patientLine: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'right',
  },
  allergyLine: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  vitalsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  summaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  summaryHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
});
