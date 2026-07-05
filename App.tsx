import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation';
import { ensureNotificationPermissions } from './src/services/notifications';

// التطبيق عربي أولاً: تفعيل الاتجاه من اليمين لليسار
// (يُطبَّق بالكامل بعد إعادة تشغيل التطبيق أول مرة)
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function App() {
  useEffect(() => {
    // طلب إذن الإشعارات مبكراً لتعمل تذكيرات المواعيد
    ensureNotificationPermissions().catch(() => undefined);
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
