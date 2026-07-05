import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TextInputProps,
  TouchableOpacity, View, ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

/* ---------- بطاقة ---------- */
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------- زر ---------- */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: ButtonProps) {
  const isOutline = variant === 'outline';
  const bg = disabled ? colors.border : variant === 'danger' ? colors.danger : isOutline ? 'transparent' : colors.primary;
  const fg = isOutline ? colors.primary : '#fff';
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }, isOutline && styles.buttonOutline, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/* ---------- حقل إدخال ---------- */
interface FieldProps extends TextInputProps {
  label: string;
}

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMultiline, style]}
        placeholderTextColor={colors.textSecondary}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

/* ---------- شارة حالة ---------- */
const badgeColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: colors.warningLight, fg: colors.warning },
  confirmed: { bg: colors.infoLight, fg: colors.info },
  completed: { bg: colors.successLight, fg: colors.success },
  cancelled: { bg: colors.dangerLight, fg: colors.danger },
};

export const statusLabels: Record<string, string> = {
  pending: 'قيد التأكيد',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export function StatusBadge({ status }: { status: string }) {
  const c = badgeColors[status] ?? { bg: colors.border, fg: colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{statusLabels[status] ?? status}</Text>
    </View>
  );
}

/* ---------- عنوان قسم ---------- */
export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={typography.subtitle}>{title}</Text>
      {action}
    </View>
  );
}

/* ---------- حالة فارغة ---------- */
export function EmptyState({ icon, message }: { icon: keyof typeof Ionicons.glyphMap; message: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={colors.border} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

/* ---------- صورة رمزية بالحروف ---------- */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .filter((w) => w && w !== 'د.')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

/* ---------- صف معلومة ---------- */
export function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoRowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldWrap: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  avatar: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoRowText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    flexShrink: 1,
  },
});
