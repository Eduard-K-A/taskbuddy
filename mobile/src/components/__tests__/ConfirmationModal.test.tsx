import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  it('shows the title and message, and calls onConfirm when the confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmationModal
        visible
        title="Discard changes?"
        message="Your draft will be lost."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Discard changes?')).toBeTruthy();
    expect(screen.getByText('Your draft will be lost.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is pressed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmationModal
        visible
        title="Discard changes?"
        message="Your draft will be lost."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.press(screen.getByLabelText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables both buttons while busy', () => {
    render(
      <ConfirmationModal
        visible
        title="Discard changes?"
        message="Your draft will be lost."
        busy
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Confirm').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByLabelText('Cancel').props.accessibilityState?.disabled).toBe(true);
  });
});
