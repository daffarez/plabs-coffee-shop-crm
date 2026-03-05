import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopNav } from './topnav';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';

vi.mock('@/src/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
            signOut: vi.fn(),
        },
    },
}));

vi.mock('../store/useloadingstore', () => ({
    useLoadingStore: vi.fn(() => ({ startLoading: vi.fn(), stopLoading: vi.fn() })),
}));

describe('TopNav', () => {
    it('renders correctly and fetches user', async () => {
        (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
        render(<TopNav />);

        expect(screen.getByText('Kopi Kita')).toBeInTheDocument();
        expect(await screen.findByText('test@example.com')).toBeInTheDocument();
    });

    it('handles logout flow including modal', async () => {
        (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
        const mockRouter = { push: vi.fn(), refresh: vi.fn() };
        vi.mocked(useRouter).mockReturnValue(mockRouter as any);
        (supabase.auth.signOut as any).mockResolvedValue({ error: null });

        render(<TopNav />);

        fireEvent.click(screen.getByText('Logout'));
        expect(screen.getByText(/Are you sure you want to end this session/i)).toBeInTheDocument();

        const confirmBtns = screen.getAllByRole('button', { name: /Log out/i });
        fireEvent.click(confirmBtns[confirmBtns.length - 1]);

        expect(supabase.auth.signOut).toHaveBeenCalled();

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });
    });

    it('handles logout cancellation', async () => {
        render(<TopNav />);
        const logoutBtn = screen.getByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtn);

        expect(screen.getByText(/Are you sure you want to end this session/i)).toBeInTheDocument();

        const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelBtn);
    });
});
