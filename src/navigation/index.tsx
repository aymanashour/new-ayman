import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import DoctorAppointments from '../screens/doctor/DoctorAppointments';
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import FollowUpsScreen from '../screens/doctor/FollowUpsScreen';
import PatientFile from '../screens/doctor/PatientFile';
import PatientsList from '../screens/doctor/PatientsList';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import VisitDetails from '../screens/doctor/VisitDetails';
import VisitScreen from '../screens/doctor/VisitScreen';
import BookingScreen from '../screens/patient/BookingScreen';
import ClinicDetails from '../screens/patient/ClinicDetails';
import MyAppointments from '../screens/patient/MyAppointments';
import MyPrescriptions from '../screens/patient/MyPrescriptions';
import PatientHome from '../screens/patient/PatientHome';
import { useStore } from '../store/useStore';
import { colors } from '../theme';
import { DoctorTabsParamList, PatientTabsParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const DoctorTabs = createBottomTabNavigator<DoctorTabsParamList>();
const PatientTabs = createBottomTabNavigator<PatientTabsParamList>();

function LogoutButton() {
  const setRole = useStore((s) => s.setRole);
  return (
    <TouchableOpacity onPress={() => setRole(null)} hitSlop={8}>
      <Ionicons name="log-out-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const tabScreenOptions = {
  headerTitleAlign: 'center' as const,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
  headerRight: () => <LogoutButton />,
  headerRightContainerStyle: { paddingEnd: 16 },
};

function DoctorTabsNavigator() {
  return (
    <DoctorTabs.Navigator screenOptions={tabScreenOptions}>
      <DoctorTabs.Screen
        name="Dashboard"
        component={DoctorDashboard}
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <DoctorTabs.Screen
        name="DoctorAppointments"
        component={DoctorAppointments}
        options={{
          title: 'المواعيد',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <DoctorTabs.Screen
        name="Patients"
        component={PatientsList}
        options={{
          title: 'المرضى',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <DoctorTabs.Screen
        name="FollowUps"
        component={FollowUpsScreen}
        options={{
          title: 'المتابعة',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
        }}
      />
    </DoctorTabs.Navigator>
  );
}

function PatientTabsNavigator() {
  return (
    <PatientTabs.Navigator screenOptions={tabScreenOptions}>
      <PatientTabs.Screen
        name="Home"
        component={PatientHome}
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <PatientTabs.Screen
        name="MyAppointments"
        component={MyAppointments}
        options={{
          title: 'مواعيدي',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <PatientTabs.Screen
        name="MyPrescriptions"
        component={MyPrescriptions}
        options={{
          title: 'وصفاتي',
          tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size} color={color} />,
        }}
      />
    </PatientTabs.Navigator>
  );
}

export default function AppNavigator() {
  const role = useStore((s) => s.role);

  if (!role) {
    return <RoleSelectScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', headerBackTitle: 'رجوع' }}>
        {role === 'doctor' ? (
          <Stack.Screen name="DoctorTabs" component={DoctorTabsNavigator} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="PatientTabs" component={PatientTabsNavigator} options={{ headerShown: false }} />
        )}
        <Stack.Screen name="PatientFile" component={PatientFile} options={{ title: 'ملف المريض' }} />
        <Stack.Screen name="Visit" component={VisitScreen} options={{ title: 'كشف جديد' }} />
        <Stack.Screen name="VisitDetails" component={VisitDetails} options={{ title: 'تفاصيل الكشف' }} />
        <Stack.Screen name="Prescription" component={PrescriptionScreen} options={{ title: 'كتابة وصفة' }} />
        <Stack.Screen name="ClinicDetails" component={ClinicDetails} options={{ title: 'تفاصيل العيادة' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'حجز موعد' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
