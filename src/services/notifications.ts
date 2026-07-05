import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Appointment, Clinic } from '../types';
import { formatTimeAr } from '../utils/dates';

/** خدمة تذكير المواعيد عبر الإشعارات المحلية */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'تذكير المواعيد',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

/**
 * يجدول تذكيرين للموعد: قبل 24 ساعة وقبل ساعة.
 * يعيد معرفات الإشعارات المجدولة (لإلغائها عند إلغاء الموعد).
 */
export async function scheduleAppointmentReminders(
  appointment: Appointment,
  clinic: Clinic | undefined,
): Promise<string[]> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return [];

  const appointmentTime = new Date(`${appointment.date}T${appointment.time}:00`);
  const clinicName = clinic?.name ?? 'العيادة';
  const ids: string[] = [];

  const reminders: { offsetMs: number; body: string }[] = [
    {
      offsetMs: 24 * 3600 * 1000,
      body: `تذكير: لديك موعد غداً الساعة ${formatTimeAr(appointment.time)} في ${clinicName}`,
    },
    {
      offsetMs: 3600 * 1000,
      body: `موعدك بعد ساعة (${formatTimeAr(appointment.time)}) في ${clinicName}`,
    },
  ];

  for (const reminder of reminders) {
    const fireAt = new Date(appointmentTime.getTime() - reminder.offsetMs);
    if (fireAt.getTime() <= Date.now()) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'تذكير بالموعد 🏥',
        body: reminder.body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: Platform.OS === 'android' ? 'appointments' : undefined,
      },
    });
    ids.push(id);
  }
  return ids;
}

export async function cancelReminders(reminderIds: string[] | undefined): Promise<void> {
  if (!reminderIds?.length) return;
  await Promise.all(
    reminderIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
  );
}
