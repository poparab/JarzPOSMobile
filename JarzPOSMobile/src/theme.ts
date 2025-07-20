import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
  MD3Theme,
} from 'react-native-paper';
import merge from 'deepmerge';

const lightColors = {
  primary: '#00678c',
  onPrimary: '#ffffff',
  secondary: '#4e616e',
  surface: '#f5f7fa',
  background: '#ffffff',
};

const darkColors = {
  primary: '#4dd0e1',
  onPrimary: '#00344a',
  secondary: '#cfd8dc',
  surface: '#121212',
  background: '#000000',
};

export const lightTheme: MD3Theme = merge(DefaultTheme, {
  colors: lightColors,
}) as MD3Theme;
export const darkTheme: MD3Theme = merge(DarkTheme, {
  colors: darkColors,
}) as MD3Theme;

// Shared roundness & typography overrides
lightTheme.roundness = 8;
darkTheme.roundness = 8;

const font = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
  thin: {
    fontFamily: 'System',
    fontWeight: '200',
  },
};

lightTheme.fonts = { ...DefaultTheme.fonts, ...font } as any;
darkTheme.fonts = { ...DarkTheme.fonts, ...font } as any;
