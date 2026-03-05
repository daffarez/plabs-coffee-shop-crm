import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from './confirmmodal';

describe('ConfirmModal', () => {
    it('does not render if not open', () => {
        const { container } = render(<ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="Test" description="Test" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders content when open', () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Warning" description="Are you sure?" />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
        const onConfirm = vi.fn();
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} title="Warning" description="Are you sure?" />);
        fireEvent.click(screen.getByText('Yes'));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onClose when cancel button clicked', () => {
        const onClose = vi.fn();
        render(<ConfirmModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="Warning" description="Are you sure?" />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('customizes buttons and variant', () => {
        render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Test" description="Test" confirmText="Okay" cancelText="No" variant="warning" />);
        expect(screen.getByText('Okay')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
    });
});
