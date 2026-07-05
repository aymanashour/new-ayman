import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState } from '../../components/ui';
import { doctors } from '../../data/seed';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateAr } from '../../utils/dates';

/** وصفات المريض مرتبة من الأحدث */
export default function MyPrescriptions() {
  const { currentPatientId, prescriptions } = useStore();

  const mine = prescriptions
    .filter((rx) => rx.patientId === currentPatientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {mine.length === 0 ? (
        <EmptyState icon="medical-outline" message="لا توجد وصفات بعد" />
      ) : (
        mine.map((rx) => {
          const doctor = doctors.find((d) => d.id === rx.doctorId);
          return (
            <Card key={rx.id}>
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Ionicons name="medical" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.diagnosis}>{rx.diagnosis}</Text>
                  <Text style={typography.caption}>
                    {doctor?.name} — {formatDateAr(rx.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.items}>
                {rx.items.map((item, i) => (
                  <View key={i} style={styles.item}>
                    <Text style={styles.drugName}>{item.drug}</Text>
                    <Text style={typography.caption}>
                      {item.dose} — {item.frequency} — لمدة {item.duration}
                    </Text>
                    {item.notes ? <Text style={typography.caption}>{item.notes}</Text> : null}
                  </View>
                ))}
              </View>

              {rx.instructions ? (
                <View style={styles.instructions}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                  <Text style={styles.instructionsText}>{rx.instructions}</Text>
                </View>
              ) : null}
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
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosis: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  items: { gap: spacing.sm },
  item: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
  },
  drugName: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'right' },
  instructions: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: 10,
    padding: spacing.sm,
  },
  instructionsText: { flex: 1, fontSize: 13, color: colors.info, textAlign: 'right', lineHeight: 20 },
});
