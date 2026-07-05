import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';
import { colors, radius, spacing } from '../theme';

export default function RoleSelectScreen() {
  const setRole = useStore((s) => s.setRole);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="pulse" size={44} color="#fff" />
        </View>
        <Text style={styles.appName}>AI Clinic</Text>
        <Text style={styles.tagline}>عيادتك الذكية — حجز، ملفات، وصفات، ومتابعة بالذكاء الاصطناعي</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity style={styles.roleCard} onPress={() => setRole('doctor')} activeOpacity={0.85}>
          <View style={[styles.roleIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="medkit" size={34} color={colors.primary} />
          </View>
          <Text style={styles.roleTitle}>أنا طبيب</Text>
          <Text style={styles.roleDesc}>
            إدارة المواعيد، ملفات المرضى، تلخيص الكشف بالذكاء الاصطناعي، كتابة الوصفات، ومتابعة الحالات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleCard} onPress={() => setRole('patient')} activeOpacity={0.85}>
          <View style={[styles.roleIcon, { backgroundColor: colors.infoLight }]}>
            <Ionicons name="person" size={34} color={colors.info} />
          </View>
          <Text style={styles.roleTitle}>أنا مريض</Text>
          <Text style={styles.roleDesc}>
            تصفح العيادات حسب التخصص، احجز موعدك، تابع وصفاتك، واستقبل تذكيرات بمواعيدك
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>نسخة تجريبية — البيانات محفوظة محلياً على جهازك</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  cards: {
    gap: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.md,
  },
});
