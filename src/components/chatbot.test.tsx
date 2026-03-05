import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatBotDashboard } from './chatbot';

describe('ChatBotDashboard', () => {
    it('toggles expansion when focused or clicked', () => {
        render(<ChatBotDashboard />);
        expect(screen.queryByText(/AI Assistant of Kopi Kita/)).toBeNull();

        const input = screen.getByPlaceholderText('Ask something to AI Assistant.');
        fireEvent.focus(input);
        expect(screen.getByText(/AI Assistant of Kopi Kita/)).toBeInTheDocument();
    });

    it('sends message and updates UI with response', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ choices: [{ message: { content: 'AI Response' } }] }),
        });

        render(<ChatBotDashboard />);
        const input = screen.getByPlaceholderText('Ask something to AI Assistant.');

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(screen.getByText('Test message')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('AI Response')).toBeInTheDocument();
        });
    });

    it('shows disconnected on API failure', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        render(<ChatBotDashboard />);
        const input = screen.getByPlaceholderText('Ask something to AI Assistant.');

        fireEvent.change(input, { target: { value: 'Testing error' } });

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(screen.getByText('Disconnected.')).toBeInTheDocument();
        });
    });

    it('handles empty input and expand toggle', () => {
        render(<ChatBotDashboard />);
        const buttons = screen.getAllByRole('button');
        const sendBtn = buttons[0];
        const toggleBtn = buttons[1];

        fireEvent.click(sendBtn);

        fireEvent.click(toggleBtn);
        expect(screen.getByText(/AI Assistant of Kopi Kita/)).toBeInTheDocument();

        fireEvent.click(toggleBtn);
    });
});
