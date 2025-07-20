import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import { AppTextInput, PrimaryButton, ScreenContainer } from '../components';
import NetInfo from '@react-native-community/netinfo';
import { AUTH_METHOD } from '@env';
import { useAuth } from '../auth/AuthContext';

export function LoginScreen(): React.ReactElement {
  const { login } = useAuth();
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  React.useEffect(() => {
    const sub = NetInfo.addEventListener((s) => setIsOffline(!s.isConnected));
    return () => sub();
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const ok = await login(field1, field2);
      if (!ok) {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  const disableBtn = loading || !field1 || !field2;

  const labels =
    AUTH_METHOD === 'apikey'
      ? { f1: 'API Key', f2: 'API Secret' }
      : { f1: 'Email or Username', f2: 'Password' };

  return (
    <ScreenContainer>
      {error && (
        <Banner
          visible
          actions={[{ label: 'Dismiss', onPress: () => setError(null) }]}
        >
          {error}
        </Banner>
      )}
      {isOffline && <Banner visible>{'No internet connection'}</Banner>}
      <AppTextInput
        label={labels.f1}
        value={field1}
        onChangeText={setField1}
        autoCapitalize="none"
      />
      <AppTextInput
        label={labels.f2}
        value={field2}
        onChangeText={setField2}
        secureTextEntry={AUTH_METHOD !== 'apikey'}
      />
      <PrimaryButton
        onPress={handleLogin}
        disabled={disableBtn}
        loading={loading}
      >
        Login
      </PrimaryButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { marginBottom: 12 },
  btn: { marginTop: 8 },
});
