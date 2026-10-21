import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PhotoCard from '../PhotoCard';

describe('PhotoCard', () => {
  it('shows the photo under its name', () => {
    render(
      <PhotoCard title="Front" uri="file:///id.jpg" retakeLabel="Retake front photo" onRetake={jest.fn()} />,
    );
    expect(screen.getByText('Front')).toBeTruthy();
    expect(screen.getByLabelText('Front photo')).toBeTruthy();
  });

  it('calls onRetake from its own Retake button', () => {
    const onRetake = jest.fn();
    render(<PhotoCard title="Selfie" uri="file:///selfie.jpg" retakeLabel="Retake selfie" onRetake={onRetake} />);
    fireEvent.press(screen.getByLabelText('Retake selfie'));
    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  it('opens the photo when it is tapped, with a named image button', () => {
    const onView = jest.fn();
    render(<PhotoCard title="Front" uri="file:///id.jpg" onView={onView} />);
    fireEvent.press(screen.getByRole('imagebutton', { name: 'View Front photo' }));
    expect(onView).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Front photo')).toBeTruthy();
  });

  it('is not tappable without onView', () => {
    render(<PhotoCard title="Front" uri="file:///id.jpg" />);
    expect(screen.queryByRole('imagebutton')).toBeNull();
  });

  it('is not tappable when there is no photo to show', () => {
    render(<PhotoCard title="Certificate" uri={null} onView={jest.fn()} />);
    expect(screen.queryByRole('imagebutton')).toBeNull();
  });
});
