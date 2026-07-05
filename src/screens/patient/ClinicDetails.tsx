import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, EmptyState, InfoRow, SectionTitle } from '../../components/ui';
import { clinics, doctors, specialties } from '../../data/seed';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

export default function ClinicDetails() {
  const route = useRoute<RouteProp<RootStackParamList, 'ClinicDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clinicId } = route.params;

  const clinic = clinics.find((c) => c.id === clinicId);
  if (!clinic) {
    return <EmptyState icon="alert-circle-outline" message="لم يتم العثور على العيادة" />;
  }
  const specialty = specialties.find((s) => s.id === clinic.specialtyId);
  const clinicDoctors = doctors.filter((d) => d.clinicId === clinicId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card>
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons
                name={(specialty?.icon ?? 'medkit-outline') as keyof typeof Ionicons.glyphMap}
                size={30}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.subtitle}>{clinic.name}</Text>
              <Text style={typography.caption}>{specialty?.name}</Text>
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={colors.accent} />
              <Text style={styles.ratingText}>{clinic.rating}</Text>
            </View>
          </View>
          <InfoRow icon="location-outline" text={clinic.address} />
          <InfoRow icon="call-outline" text={clinic.phone} />
          <InfoRow icon="time-outline" text={clinic.workingHours} />
        </Card>

        <SectionTitle title="الأطباء" />
        {clinicDoctors.map((doctor) => (
          <Card key={doctor.id}>
            <View style={styles.doctorRow}>
              <Avatar name={doctor.name} />
              <View>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={typography.caption}>{doctor.title}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="احجز موعداً الآن"
          icon="calendar"
          onPress={() => navigation.navigate('Booking', { clinicId })}
        />
      </View>
    </View>
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
  icon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rating: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 15, fontWeight: '700', color: colors.text },
  doctorRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  doctorName: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
