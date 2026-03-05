import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from './toast';
import { useToastStore } from '../store/usetoaststore';

vi.mock('../store/usetoaststore', () => ({
    useToastStore: vi.fn(),
}));

describe('Toast', () => {
    it('does not render when not open', () => {
        (useToastStore as any).mockReturnValue({ isOpen: false, message: '', type: 'info', hideToast: vi.fn() });
        const { container } = render(<Toast />);
        expect(container.firstChild).toBeNull();
    });

    it('renders message and calls hideToast on close', () => {
        const hideToast = vi.fn();
        (useToastStore as any).mockReturnValue({ isOpen: true, message: 'Saved!', type: 'success', hideToast });

        render(<Toast />);

        expect(screen.getByText('Saved!')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();

        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        expect(hideToast).toHaveBeenCalled();
    });

    it('renders error type', () => {
        const hideToast = vi.fn();
        (useToastStore as any).mockReturnValue({ isOpen: true, message: 'Failed!', type: 'error', hideToast });
        render(<Toast />);
        expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders info type', () => {
        const hideToast = vi.fn();
        (useToastStore as any).mockReturnValue({ isOpen: true, message: 'Info!', type: 'info', hideToast });
        render(<Toast />);
        expect(screen.getByText('Info')).toBeInTheDocument();
    });
});
