import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';

export function AppTextInput(props: TextInputProps): React.ReactElement {
  return (
    <TextInput
      mode="outlined"
      style={[{ marginBottom: 12 }, props.style]}
      {...props}
    />
  );
}
