import { describe, it, expect, vi } from 'vitest';
import { createBrowserClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn(() => ({ mockClient: true })),
}));

describe('supabase', () => {
    it('creates browser client with env config', async () => {
        const { supabase } = await import('./supabase');
        expect(createBrowserClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        expect(supabase).toEqual({ mockClient: true });
    });
});
