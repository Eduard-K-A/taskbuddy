import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import HelpSupportScreen from '../HelpSupportScreen';

describe('HelpSupportScreen — tutorial replay entry point', () => {
  it('shows a "View tutorial" row and calls onViewTutorial when pressed', () => {
    const onViewTutorial = jest.fn();
    render(<HelpSupportScreen role="homeowner" onBack={jest.fn()} onViewTutorial={onViewTutorial} />);

    fireEvent.press(screen.getByText('View tutorial'));

    expect(onViewTutorial).toHaveBeenCalledTimes(1);
  });

  it('does not show the row when onViewTutorial is not provided', () => {
    render(<HelpSupportScreen role="provider" onBack={jest.fn()} />);

    expect(screen.queryByText('View tutorial')).toBeNull();
  });
});
