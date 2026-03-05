import { describe, it, expect, vi } from 'vitest';
import Home from './page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

describe('Home', () => {
    it('redirects to login', () => {
        Home();
        expect(redirect).toHaveBeenCalledWith('/login');
    });
});
