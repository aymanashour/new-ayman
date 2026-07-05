import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Button, Card, EmptyState, Field, SectionTitle } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { suggestPrescription } from '../../services/ai';
import { useStore } from '../../store/useStore';
import { PrescriptionItem } from '../../types';
import { colors, spacing, typography } from '../../theme';

/**
 * شاشة كتابة الوصفة: إضافة أدوية يدوياً أو الاستعانة باقتراح الذكاء الاصطناعي،
 * مع تحذيرات الحساسية والأمراض المزمنة.
 */
export default function PrescriptionScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Prescription'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientId, visitId, diagnosis: initialDiagnosis } = route.params;

  const { patients, currentDoctorId, addPrescription, addFollowUp } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  const [diagnosis, setDiagnosis] = useState(initialDiagnosis ?? '');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  // حقول إضافة دواء
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

  if (!patient) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على المريض" />;
  }

  const addItem = () => {
    if (!drug.trim()) {
      Alert.alert('تنبيه', 'أدخل اسم الدواء');
      return;
    }
    setItems([
      ...items,
      {
        drug: drug.trim(),
        dose: dose.trim() || 'حسب الإرشادات',
        frequency: frequency.trim() || 'حسب الإرشادات',
        duration: duration.trim() || 'حسب الحالة',
      },
    ]);
    setDrug('');
    setDose('');
    setFrequency('');
    setDuration('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSuggest = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('تنبيه', 'أدخل التشخيص أولاً ليتمكن الذكاء الاصطناعي من الاقتراح');
      return;
    }
    setSuggesting(true);
    try {
      const suggestion = await suggestPrescription(patient, diagnosis.trim());
      setItems((prev) => [...prev, ...suggestion.items]);
      if (suggestion.instructions) setInstructions(suggestion.instructions);
      setWarnings(suggestion.warnings);
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = () => {
    if (items.length === 0) {
      Alert.alert('تنبيه', 'أضف دواءً واحداً على الأقل');
      return;
    }
    addPrescription({
      visitId,
      patientId,
      doctorId: currentDoctorId,
      date: new Date().toISOString(),
      diagnosis: diagnosis.trim(),
      items,
      instructions: instructions.trim() || undefined,
    });

    // متابعة تلقائية بعد أسبوع من صرف الوصفة
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);
    addFollowUp({
      patientId,
      doctorId: currentDoctorId,
      title: `متابعة استجابة العلاج — ${diagnosis.trim() || 'وصفة جديدة'}`,
      dueDate: followUpDate.toISOString().slice(0, 10),
      notes: 'أُنشئت تلقائياً عند صرف الوصفة',
    });

    Alert.alert('تم', 'حُفظت الوصفة وأُضيفت مهمة متابعة بعد أسبوع', [
      { text: 'حسناً', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
        <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
          <Text style={styles.patientLine}>{patient.name}</Text>
          {patient.allergies.length > 0 && (
            <Text style={styles.allergyLine}>⚠️ حساسية: {patient.allergies.join('، ')}</Text>
          )}
          {patient.chronicDiseases.length > 0 && (
            <Text style={styles.chronicLine}>أمراض مزمنة: {patient.chronicDiseases.join('، ')}</Text>
          )}
        </Card>

        <Field label="التشخيص" placeholder="التشخيص" value={diagnosis} onChangeText={setDiagnosis} />

        <Button
          title="اقتراح وصفة بالذكاء الاصطناعي"
          icon="sparkles"
          variant="outline"
          onPress={handleSuggest}
          loading={suggesting}
        />

        {warnings.length > 0 && (
          <Card style={styles.warningCard}>
            {warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>• {w}</Text>
            ))}
          </Card>
        )}

        <SectionTitle title={`الأدوية (${items.length})`} />
        {items.map((item, index) => (
          <Card key={index}>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.drugName}>{item.drug}</Text>
                <Text style={typography.caption}>
                  {item.dose} — {item.frequency} — لمدة {item.duration}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(index)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <SectionTitle title="إضافة دواء" />
        <Field label="اسم الدواء" placeholder="مثال: أموكسيسيلين 500 ملجم" value={drug} onChangeText={setDrug} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="الجرعة" placeholder="قرص واحد" value={dose} onChangeText={setDose} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="عدد المرات" placeholder="3 مرات يومياً" value={frequency} onChangeText={setFrequency} />
          </View>
        </View>
        <Field label="المدة" placeholder="أسبوع" value={duration} onChangeText={setDuration} />
        <Button title="إضافة الدواء" icon="add" variant="outline" onPress={addItem} />

        <Field
          label="تعليمات للمريض"
          placeholder="إرشادات عامة، نصائح غذائية..."
          value={instructions}
          onChangeText={setInstructions}
          multiline
          style={{ marginTop: spacing.md }}
        />

        <Button
          title="حفظ الوصفة"
          icon="save-outline"
          onPress={handleSave}
          style={{ marginBottom: spacing.xl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  patientLine: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, textAlign: 'right' },
  allergyLine: { fontSize: 13, color: colors.danger, fontWeight: '600', textAlign: 'right', marginTop: 4 },
  chronicLine: { fontSize: 13, color: colors.warning, fontWeight: '600', textAlign: 'right', marginTop: 2 },
  warningCard: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningLight,
    marginTop: spacing.sm,
  },
  warningText: { fontSize: 13, color: colors.warning, textAlign: 'right', lineHeight: 22 },
  itemRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  drugName: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: spacing.sm },
});
