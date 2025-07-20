import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../src/screens/LoginScreen';

jest.mock('../src/auth/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve(true)),
  }),
}));

describe('LoginScreen', () => {
  it('enables Login button when both fields are filled', () => {
    const { getByText, getAllByA11yLabel } = render(<LoginScreen />);

    const loginButton = getByText('Login');
    // Initially disabled
    expect(loginButton.props.accessibilityState?.disabled).toBe(true);

    const inputs = getAllByA11yLabel(/(API Key|Email|Username)/i);
    fireEvent.changeText(inputs[0], 'user');
    fireEvent.changeText(inputs[1], 'secret');

    expect(loginButton.props.accessibilityState?.disabled).toBe(false);
  });
});
