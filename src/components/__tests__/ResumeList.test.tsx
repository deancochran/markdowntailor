import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ResumeList from '../ResumeList';

// Mock router functions
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/resumes',
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ResumeList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        resumes: [
          { filename: 'resume1', path: '/resumes/resume1' },
          { filename: 'resume2', path: '/resumes/resume2' },
        ]
      })
    });
  });
  
  it('displays loading state and then shows resumes', async () => {
    // Render component
    render(<ResumeList />);

    // Check initial loading state
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Wait for resumes to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Verify resumes are displayed
    expect(screen.getByText('resume1')).toBeInTheDocument();
    expect(screen.getByText('resume2')).toBeInTheDocument();
  });

  it('shows empty state when no resumes exist', async () => {
    // Override fetch for this test
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ resumes: [] })
    });

    // Render component
    render(<ResumeList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Verify empty state is shown
    expect(screen.getByText(/No resumes found/i)).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    // Override fetch to return error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    // Render component
    render(<ResumeList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Verify error state is shown
    expect(screen.getByText(/Error loading resumes/i)).toBeInTheDocument();
  });

  it('creates a new resume successfully', async () => {
    // Setup successful POST response
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          resumes: [
            { filename: 'resume1', path: '/resumes/resume1' },
            { filename: 'resume2', path: '/resumes/resume2' },
          ]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }));
    
    // Setup user event
    const user = userEvent.setup();
    
    // Render component
    render(<ResumeList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Type new resume name
    const input = screen.getByPlaceholderText(/Enter resume name/i);
    await user.type(input, 'test-resume');

    // Submit form
    const createButton = screen.getByRole('button', { name: /Create Resume/i });
    await user.click(createButton);

    // Verify POST request was made
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/resumes/test-resume',
      expect.objectContaining({
        method: 'POST'
      })
    );
    
    // Verify navigation was called with correct path
    expect(mockPush).toHaveBeenCalledWith('/editor/test-resume');
  });

  it('sanitizes resume name with special characters', async () => {
    // Override fetch implementations
    const fetchSpy = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          resumes: [
            { filename: 'resume1', path: '/resumes/resume1' },
          ]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }));
      
    global.fetch = fetchSpy;

    // Setup user event
    const user = userEvent.setup();

    // Render component
    render(<ResumeList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Type resume name with special characters
    const input = screen.getByPlaceholderText(/Enter resume name/i);
    await user.type(input, 'test/resume?with:special*chars');

    // Submit form
    const createButton = screen.getByRole('button', { name: /Create Resume/i });
    await user.click(createButton);

    // Verify sanitized name was used in the API call
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenLastCalledWith(
      '/api/resumes/test-resume-with-special-chars',
      expect.anything()
    );
  });

  it('prevents submission with empty resume name', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Render component
    render(<ResumeList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Click create without entering a name
    const createButton = screen.getByRole('button', { name: /Create Resume/i });
    await user.click(createButton);

    // Verify form was not submitted
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial GET call
    expect(mockPush).not.toHaveBeenCalled();
  });
});