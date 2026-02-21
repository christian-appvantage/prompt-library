/**
 * Unit Tests for IntentInput Component
 * Tests the text input, form submission, and callback behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IntentInput from '@/components/IntentInput';

describe('IntentInput Component', () => {
  describe('Rendering', () => {
    it('should render the text input field', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render the submit button', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show helpful text about keyboard shortcuts', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      // Use getAllByText since "Enter" appears in both the kbd element and the text
      const enterElements = screen.getAllByText(/enter/i);
      expect(enterElements.length).toBeGreaterThan(0);

      // Shift+Enter is unique
      expect(screen.getByText(/shift\+enter/i)).toBeInTheDocument();
    });

    it('should pre-fill textarea when initialValue is provided', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} initialValue="pre-filled text" />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      expect(textarea).toHaveValue('pre-filled text');
    });
  });

  describe('User Input', () => {
    it('should update textarea value on input', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      await userEvent.type(textarea, 'Help me write an email');

      expect(textarea).toHaveValue('Help me write an email');
    });

    it('should clear error when user types', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);

      // Try to submit empty
      fireEvent.keyDown(textarea, { key: 'Enter' });

      // Error should appear
      await waitFor(() => {
        expect(screen.getByText(/please describe/i)).toBeInTheDocument();
      });

      // Type something
      await userEvent.type(textarea, 'a');

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText(/please describe/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should show error when submitting empty input', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/please describe/i)).toBeInTheDocument();
      });
    });

    it('should call onSubmit when Enter is pressed with valid input', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      await userEvent.type(textarea, 'Help me write an email');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Help me write an email');
      });
    });

    it('should NOT submit when Shift+Enter is pressed', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      await userEvent.type(textarea, 'Help me write an email');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should trim the intent before passing to onSubmit', async () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      await userEvent.type(textarea, '  Help me write an email  ');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Help me write an email');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable input when isLoading is true', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} isLoading={true} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      expect(textarea).toBeDisabled();
    });

    it('should not disable input when isLoading is false', () => {
      const onSubmit = jest.fn();
      render(<IntentInput onSubmit={onSubmit} isLoading={false} />);

      const textarea = screen.getByPlaceholderText(/I need to write a professional email/i);
      expect(textarea).not.toBeDisabled();
    });
  });
});
