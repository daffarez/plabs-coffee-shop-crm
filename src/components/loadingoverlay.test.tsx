import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingOverlay } from './loadingoverlay';
import { useLoadingStore } from '../store/useloadingstore';

vi.mock('../store/useloadingstore', () => ({
    useLoadingStore: vi.fn(),
}));

describe('LoadingOverlay', () => {
    it('does not render when not loading', () => {
        (useLoadingStore as any).mockReturnValue({ isLoading: false, message: null });
        const { container } = render(<LoadingOverlay />);
        expect(container.firstChild).toBeNull();
    });

    it('renders when loading with message', () => {
        (useLoadingStore as any).mockReturnValue({ isLoading: true, message: 'Brewing...' });
        render(<LoadingOverlay />);
        expect(screen.getByText('Brewing...')).toBeInTheDocument();
    });
});
