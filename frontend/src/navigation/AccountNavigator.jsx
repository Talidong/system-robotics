// src/navigation/AccountNavigator.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ACCOUNT_ROUTES } from '../constants/accountRoutes';

import AccountProfileScreen from '../screens/account/AccountProfileScreen';
import ChangePersonalInfoScreen from '../screens/account/ChangePersonalInfoScreen';
import ChangeEmailScreen from '../screens/account/ChangeEmailScreen';
import ChangeEmailVerificationScreen from '../screens/account/ChangeEmailVerificationScreen';
import ChangeEmailSuccessScreen from '../screens/account/ChangeEmailSuccessScreen';
import ChangePhoneNumberScreen from '../screens/account/ChangePhoneNumberScreen';
import ChangePhoneVerificationScreen from '../screens/account/ChangePhoneVerificationScreen';
import ChangePhoneSuccessScreen from '../screens/account/ChangePhoneSuccessScreen';
import ChangePasswordScreen from '../screens/account/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function AccountNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ACCOUNT_ROUTES.PROFILE}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={ACCOUNT_ROUTES.PROFILE} component={AccountProfileScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_PERSONAL_INFO} component={ChangePersonalInfoScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_EMAIL} component={ChangeEmailScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_EMAIL_VERIFICATION} component={ChangeEmailVerificationScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_EMAIL_SUCCESS} component={ChangeEmailSuccessScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_PHONE} component={ChangePhoneNumberScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_PHONE_VERIFICATION} component={ChangePhoneVerificationScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_PHONE_SUCCESS} component={ChangePhoneSuccessScreen} />
      <Stack.Screen name={ACCOUNT_ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}