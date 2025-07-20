import React from 'react';
import { Appbar } from 'react-native-paper';

export interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps): React.ReactElement {
  return (
    <Appbar.Header>
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
