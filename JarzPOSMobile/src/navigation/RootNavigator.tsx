import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SessionStack } from '../screens/SessionStack';
import { useInvoiceSync } from '../offline/useInvoiceSync';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { usePos } from '../auth/PosContext';
import { useGetPosProfilesQuery } from '../api/posApi';
import { PosProfilePickerScreen } from '../screens/PosProfilePicker';
import { ActivityIndicator, View } from 'react-native';
import { setProfiles as setProfilesAction } from '../store/posProfileSlice';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  ProfilePicker: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const { profile, setProfile } = usePos();
  const dispatch = useAppDispatch();
  const {
    data: profiles,
    isLoading,
    isSuccess,
  } = useGetPosProfilesQuery(undefined, {
    skip: !isAuthenticated,
  });

  React.useEffect(() => {
    if (isSuccess && profiles) {
      dispatch(setProfilesAction(profiles));
      if (profiles.length === 1) {
        setProfile(profiles[0].name);
      }
    }
  }, [dispatch, profiles, isSuccess, setProfile]);

  if (isAuthenticated && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : profile ? (
          <Stack.Screen name="App" component={SessionStack} />
        ) : (
          <Stack.Screen
            name="ProfilePicker"
            component={PosProfilePickerScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
