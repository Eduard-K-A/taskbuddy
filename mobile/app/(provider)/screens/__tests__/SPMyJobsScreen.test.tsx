import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SPMyJobsScreen from '../SPMyJobsScreen';
import { api } from '../../../../src/lib/api';
import { clearAsyncDataCache } from '../../../../src/hooks/useAsyncData';
import { clearRetainedState } from '../../../../src/hooks/useRetainedState';

jest.mock('../../../../src/lib/api', () => ({
  api: {
    myApplications: jest.fn(),
    assignedJobs: jest.fn(),
  },
}));

const cancelledJob = {
  id: 'job-cancelled',
  title: 'Cancelled sink repair',
  status: 'cancelled',
  urgency: 'normal',
  address: '456 Side St',
  budget: 800,
  scheduled_at: null,
};

const activeJob = {
  id: 'job-active',
  title: 'Active cleaning',
  status: 'confirmed',
  urgency: 'normal',
  address: '789 Main St',
  budget: 1200,
  scheduled_at: null,
};

const completedJob = {
  id: 'job-completed',
  title: 'Completed handyman work',
  status: 'completed',
  urgency: 'normal',
  address: '12 Oak Ave',
  budget: 2000,
  scheduled_at: null,
};

describe('SPMyJobsScreen — declined-job visibility (Cancelled tab)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAsyncDataCache();
    clearRetainedState();
    (api.myApplications as jest.Mock).mockResolvedValue([]);
    (api.assignedJobs as jest.Mock).mockResolvedValue([cancelledJob, activeJob, completedJob]);
  });

  it('does not show a cancelled job under Active or Completed', async () => {
    render(<SPMyJobsScreen onNavigate={jest.fn()} />);

    fireEvent.press(screen.getByText('Active'));
    await waitFor(() => expect(screen.getByText('Active cleaning')).toBeTruthy());
    expect(screen.queryByText('Cancelled sink repair')).toBeNull();

    fireEvent.press(screen.getByText('Completed'));
    await waitFor(() => expect(screen.getByText('Completed handyman work')).toBeTruthy());
    expect(screen.queryByText('Cancelled sink repair')).toBeNull();
  });

  it('shows a cancelled job under a new Cancelled tab', async () => {
    render(<SPMyJobsScreen onNavigate={jest.fn()} />);

    fireEvent.press(screen.getByText('Cancelled'));
    await waitFor(() => expect(screen.getByText('Cancelled sink repair')).toBeTruthy());
  });

  it('treats an expired job the same as cancelled', async () => {
    (api.assignedJobs as jest.Mock).mockResolvedValue([
      { ...cancelledJob, id: 'job-expired', title: 'Expired job', status: 'expired' },
    ]);

    render(<SPMyJobsScreen onNavigate={jest.fn()} />);

    fireEvent.press(screen.getByText('Cancelled'));
    await waitFor(() => expect(screen.getByText('Expired job')).toBeTruthy());
  });
});
