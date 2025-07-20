import React from 'react';
import { Surface } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  style,
}: ScreenContainerProps): React.ReactElement {
  return (
    <Surface style={[{ flex: 1, padding: 16 }, style]}>{children}</Surface>
  );
}
