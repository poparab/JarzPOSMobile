import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

export function PrimaryButton(props: ButtonProps): React.ReactElement {
  return (
    <Button mode="contained" {...props}>
      {props.children}
    </Button>
  );
}
