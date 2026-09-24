import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { useAuth } from '../../../../src/context/AuthContext';

jest.mock('../../../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const baseProps = {
  onRegister: jest.fn(),
  onLogin: jest.fn(),
  onGoogleSignIn: jest.fn(),
};

describe('RegisterScreen — required-field asterisks (#15)', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ verifyEmailOtp: jest.fn() });
  });

  it('marks Full Name, Email, Password and Confirm Password as required (homeowner role)', () => {
    render(<RegisterScreen {...baseProps} />);

    // Each required label renders as "<Label>" followed by a nested " *" Text
    // node, so the label's full flattened text content is "<Label> *".
    for (const label of ['Full Name', 'Email Address', 'Password', 'Confirm Password']) {
      expect(screen.getByText(`${label} *`)).toBeTruthy();
    }

    // Skill Category (SP-only) must not appear for the homeowner role.
    expect(screen.queryByText(/Skill Category/)).toBeNull();
  });

  it('also marks Skill Category as required for the provider role', () => {
    render(<RegisterScreen {...baseProps} />);

    fireEvent.press(screen.getByText('Service Provider'));

    expect(screen.getByText('Skill Category *')).toBeTruthy();
  });
});
