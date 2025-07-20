import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
// @ts-ignore
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import { store, persistor } from './src/store/store';
import { RootNavigator } from './src/navigation';
import { AuthProvider } from './src/auth/AuthContext';
import { PosProvider } from './src/auth/PosContext';

export default function App(): React.ReactElement {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
    <AuthProvider>
      <PosProvider>
            <PaperProvider theme={theme}>
              <RootNavigator />
            </PaperProvider>
          </PosProvider>
        </AuthProvider>
          </PersistGate>
        </ReduxProvider>
  );
}
