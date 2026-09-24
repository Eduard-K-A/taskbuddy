import React from 'react';
import { Keyboard } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import WithdrawModal from '../WithdrawModal';

describe('WithdrawModal — keyboard dismissal on outside tap (#7/#17)', () => {
  it('dismisses the keyboard, but does not close the modal, when the card body is tapped', () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
    const onClose = jest.fn();
    const onFiled = jest.fn();

    render(
      <WithdrawModal visible available={1000} onClose={onClose} onFiled={onFiled} />,
    );

    fireEvent.press(screen.getByTestId('withdraw-dialog'), { stopPropagation: jest.fn() });

    expect(dismissSpy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    dismissSpy.mockRestore();
  });
});
