import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, EmptyState, InfoRow, SectionTitle } from '../../components/ui';
import { clinics, doctors, specialties } from '../../data/seed';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';

/** الشاشة الرئيسية للمريض: تصفح العيادات حسب التخصص */
export default function PatientHome() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patients, currentPatientId } = useStore();
  const patient = patients.find((p) => p.id === currentPatientId);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const filteredClinics = selectedSpecialty
    ? clinics.filter((c) => c.specialtyId === selectedSpecialty)
    : clinics;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={typography.title}>مرحباً {patient?.name?.split(' ')[0]} 👋</Text>
      <Text style={typography.caption}>ابحث عن العيادة المناسبة واحجز موعدك</Text>

      <SectionTitle title="التخصصات" />
      <View style={styles.specialtiesGrid}>
        <TouchableOpacity
          style={[styles.specialtyCard, !selectedSpecialty && styles.specialtyActive]}
          onPress={() => setSelectedSpecialty(null)}
        >
          <Ionicons name="apps-outline" size={26} color={!selectedSpecialty ? '#fff' : colors.primary} />
          <Text style={[styles.specialtyName, !selectedSpecialty && styles.specialtyNameActive]}>الكل</Text>
        </TouchableOpacity>
        {specialties.map((sp) => {
          const active = selectedSpecialty === sp.id;
          return (
            <TouchableOpacity
              key={sp.id}
              style={[styles.specialtyCard, active && styles.specialtyActive]}
              onPress={() => setSelectedSpecialty(active ? null : sp.id)}
            >
              <Ionicons
                name={sp.icon as keyof typeof Ionicons.glyphMap}
                size={26}
                color={active ? '#fff' : colors.primary}
              />
              <Text style={[styles.specialtyName, active && styles.specialtyNameActive]}>{sp.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionTitle title={`العيادات (${filteredClinics.length})`} />
      {filteredClinics.length === 0 ? (
        <EmptyState icon="business-outline" message="لا توجد عيادات في هذا التخصص حالياً" />
      ) : (
        filteredClinics.map((clinic) => {
          const specialty = specialties.find((s) => s.id === clinic.specialtyId);
          const doctor = doctors.find((d) => d.clinicId === clinic.id);
          return (
            <TouchableOpacity
              key={clinic.id}
              onPress={() => navigation.navigate('ClinicDetails', { clinicId: clinic.id })}
              activeOpacity={0.7}
            >
              <Card>
                <View style={styles.clinicHeader}>
                  <View style={styles.clinicIcon}>
                    <Ionicons
                      name={(specialty?.icon ?? 'medkit-outline') as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clinicName}>{clinic.name}</Text>
                    <Text style={typography.caption}>{specialty?.name} — {doctor?.name}</Text>
                  </View>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color={colors.accent} />
                    <Text style={styles.ratingText}>{clinic.rating}</Text>
                  </View>
                </View>
                <InfoRow icon="location-outline" text={clinic.address} />
                <InfoRow icon="time-outline" text={clinic.workingHours} />
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  specialtiesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyCard: {
    width: '22%',
    flexGrow: 1,
    aspectRatio: 1.1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  specialtyActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  specialtyName: { fontSize: 12, fontWeight: '600', color: colors.text },
  specialtyNameActive: { color: '#fff' },
  clinicHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: 6,
  },
  clinicIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicName: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  rating: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.text },
});
