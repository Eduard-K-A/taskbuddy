import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal — destructive styling', () => {
  it('renders the confirm button red when destructive', () => {
    render(
      <ConfirmationModal
        visible
        destructive
        title="Discard changes?"
        message="Your draft will be lost."
        confirmLabel="Discard & Exit"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const button = screen.getByLabelText('Discard & Exit');
    const flatStyle = [].concat(button.props.style).reduce(
      (acc: Record<string, unknown>, s: Record<string, unknown>) => ({ ...acc, ...s }),
      {},
    );
    expect(flatStyle.backgroundColor).toBe('#b91c1c');
  });

  it('keeps the default (non-red) style when not destructive', () => {
    render(
      <ConfirmationModal
        visible
        title="Mark complete?"
        message="This releases funds."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const button = screen.getByLabelText('Confirm');
    const flatStyle = [].concat(button.props.style).reduce(
      (acc: Record<string, unknown>, s: Record<string, unknown>) => ({ ...acc, ...s }),
      {},
    );
    expect(flatStyle.backgroundColor).not.toBe('#b91c1c');
  });
});
