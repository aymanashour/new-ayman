import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, EmptyState } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, spacing, typography } from '../../theme';
import { ageFromBirthDate } from '../../utils/dates';

export default function PatientsList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const patients = useStore((s) => s.patients);
  const [query, setQuery] = useState('');

  const filtered = patients.filter(
    (p) => p.name.includes(query.trim()) || p.phone.includes(query.trim()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          textAlign="right"
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {filtered.length === 0 ? (
          <EmptyState icon="people-outline" message="لا يوجد مرضى مطابقون للبحث" />
        ) : (
          filtered.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              onPress={() => navigation.navigate('PatientFile', { patientId: patient.id })}
              activeOpacity={0.7}
            >
              <Card>
                <View style={styles.row}>
                  <Avatar name={patient.name} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{patient.name}</Text>
                    <Text style={typography.caption}>
                      {ageFromBirthDate(patient.birthDate)} سنة — {patient.phone}
                    </Text>
                    {patient.chronicDiseases.length > 0 && (
                      <Text style={styles.chronic}>{patient.chronicDiseases.join(' • ')}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  chronic: {
    fontSize: 12,
    color: colors.warning,
    textAlign: 'right',
    marginTop: 2,
  },
});
