import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, SectionTitle } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr } from '../../utils/dates';

/** عرض تفاصيل كشف سابق */
export default function VisitDetails() {
  const route = useRoute<RouteProp<RootStackParamList, 'VisitDetails'>>();
  const { visitId } = route.params;
  const { visits, patients, prescriptions } = useStore();

  const visit = visits.find((v) => v.id === visitId);
  if (!visit) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على الكشف" />;
  }
  const patient = patients.find((p) => p.id === visit.patientId);
  const relatedRx = prescriptions.filter((rx) => rx.visitId === visitId);

  const vitalRows = [
    { label: 'الضغط', value: visit.vitals.bloodPressure },
    { label: 'النبض', value: visit.vitals.heartRate },
    { label: 'الحرارة', value: visit.vitals.temperature },
    { label: 'الوزن', value: visit.vitals.weight },
  ].filter((v) => v.value);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Card>
        <Text style={typography.subtitle}>{patient?.name}</Text>
        <Text style={typography.caption}>{formatDateAr(visit.date)}</Text>
      </Card>

      {visit.aiSummary ? (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.summaryTitle}>ملخص الكشف (AI)</Text>
          </View>
          <Text style={styles.summaryText}>{visit.aiSummary}</Text>
        </Card>
      ) : null}

      <SectionTitle title="تفاصيل الكشف" />
      <Card>
        <DetailRow label="الشكوى" value={visit.complaint} />
        <DetailRow label="الفحص" value={visit.examNotes} />
        <DetailRow label="التشخيص" value={visit.diagnosis} />
      </Card>

      {vitalRows.length > 0 && (
        <>
          <SectionTitle title="العلامات الحيوية" />
          <Card>
            <View style={styles.vitalsGrid}>
              {vitalRows.map((v) => (
                <View key={v.label} style={styles.vitalBox}>
                  <Text style={styles.vitalValue}>{v.value}</Text>
                  <Text style={typography.caption}>{v.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}

      {relatedRx.length > 0 && (
        <>
          <SectionTitle title="الوصفة المرتبطة" />
          {relatedRx.map((rx) => (
            <Card key={rx.id}>
              {rx.items.map((item, i) => (
                <Text key={i} style={styles.rxItem}>
                  • {item.drug} — {item.dose}، {item.frequency} ({item.duration})
                </Text>
              ))}
              {rx.instructions ? <Text style={typography.caption}>{rx.instructions}</Text> : null}
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryCard: { borderColor: colors.primary, borderWidth: 1.5, marginTop: spacing.sm },
  summaryHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  summaryText: { fontSize: 14, color: colors.text, lineHeight: 24, textAlign: 'right' },
  detailRow: { marginBottom: spacing.sm },
  detailLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textAlign: 'right' },
  detailValue: { fontSize: 15, color: colors.text, textAlign: 'right', marginTop: 2, lineHeight: 22 },
  vitalsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  vitalBox: {
    flexGrow: 1,
    minWidth: '40%',
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  vitalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  rxItem: { fontSize: 14, color: colors.text, textAlign: 'right', marginBottom: 4 },
});
