import React from 'react';
import { Keyboard } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import DeclineBookingModal from '../DeclineBookingModal';

describe('DeclineBookingModal — keyboard dismissal on outside tap (#7/#17)', () => {
  it('dismisses the keyboard, but does not close the dialog, when the dialog body is tapped', () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <DeclineBookingModal
        visible
        jobTitle="Fix the sink"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    // Press the dialog's own Pressable directly (empty space), not a
    // descendant — this must not bubble to the backdrop's onCancel.
    fireEvent.press(screen.getByTestId('decline-dialog'), { stopPropagation: jest.fn() });

    expect(dismissSpy).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();

    dismissSpy.mockRestore();
  });
});
