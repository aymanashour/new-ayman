import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, EmptyState, SectionTitle } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { ageFromBirthDate, formatDateAr } from '../../utils/dates';

export default function PatientFile() {
  const route = useRoute<RouteProp<RootStackParamList, 'PatientFile'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientId } = route.params;

  const { patients, visits, prescriptions } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على المريض" />;
  }

  const patientVisits = visits
    .filter((v) => v.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const patientPrescriptions = prescriptions
    .filter((rx) => rx.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {/* بطاقة المريض */}
      <Card>
        <View style={styles.headerRow}>
          <Avatar name={patient.name} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{patient.name}</Text>
            <Text style={typography.caption}>
              {ageFromBirthDate(patient.birthDate)} سنة — {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
              {patient.bloodType ? ` — فصيلة ${patient.bloodType}` : ''}
            </Text>
            <Text style={typography.caption}>{patient.phone}</Text>
          </View>
        </View>

        {(patient.allergies.length > 0 || patient.chronicDiseases.length > 0) && (
          <View style={styles.alerts}>
            {patient.allergies.length > 0 && (
              <View style={styles.alertRow}>
                <Ionicons name="warning" size={16} color={colors.danger} />
                <Text style={styles.alertText}>حساسية: {patient.allergies.join('، ')}</Text>
              </View>
            )}
            {patient.chronicDiseases.length > 0 && (
              <View style={styles.alertRow}>
                <Ionicons name="fitness" size={16} color={colors.warning} />
                <Text style={[styles.alertText, { color: colors.warning }]}>
                  أمراض مزمنة: {patient.chronicDiseases.join('، ')}
                </Text>
              </View>
            )}
          </View>
        )}
        {patient.notes ? <Text style={styles.notes}>{patient.notes}</Text> : null}
      </Card>

      <Button
        title="كشف جديد"
        icon="add-circle-outline"
        onPress={() => navigation.navigate('Visit', { patientId })}
        style={{ marginVertical: spacing.sm }}
      />

      {/* سجل الزيارات */}
      <SectionTitle title={`سجل الزيارات (${patientVisits.length})`} />
      {patientVisits.length === 0 ? (
        <EmptyState icon="document-text-outline" message="لا توجد زيارات مسجلة" />
      ) : (
        patientVisits.map((visit) => (
          <TouchableOpacity
            key={visit.id}
            onPress={() => navigation.navigate('VisitDetails', { visitId: visit.id })}
            activeOpacity={0.7}
          >
            <Card>
              <View style={styles.visitHeader}>
                <Text style={styles.visitDiagnosis}>{visit.diagnosis || visit.complaint}</Text>
                {visit.aiSummary ? (
                  <View style={styles.aiTag}>
                    <Ionicons name="sparkles" size={12} color={colors.primary} />
                    <Text style={styles.aiTagText}>ملخص AI</Text>
                  </View>
                ) : null}
              </View>
              <Text style={typography.caption}>{formatDateAr(visit.date)}</Text>
              <Text style={typography.caption} numberOfLines={2}>
                {visit.aiSummary ?? visit.examNotes}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      {/* الوصفات */}
      <SectionTitle title={`الوصفات (${patientPrescriptions.length})`} />
      {patientPrescriptions.length === 0 ? (
        <EmptyState icon="medical-outline" message="لا توجد وصفات" />
      ) : (
        patientPrescriptions.map((rx) => (
          <Card key={rx.id}>
            <Text style={styles.visitDiagnosis}>{rx.diagnosis}</Text>
            <Text style={typography.caption}>{formatDateAr(rx.date)}</Text>
            {rx.items.map((item, i) => (
              <Text key={i} style={styles.rxItem}>
                • {item.drug} — {item.dose}، {item.frequency} ({item.duration})
              </Text>
            ))}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  alerts: {
    marginTop: spacing.md,
    gap: 6,
  },
  alertRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  alertText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'right',
  },
  notes: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  visitHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitDiagnosis: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    flexShrink: 1,
  },
  aiTag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  aiTagText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  rxItem: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'right',
    marginTop: 4,
  },
});
