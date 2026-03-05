import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn((url, key, options) => {
        options.cookies.getAll();
        options.cookies.setAll([{ name: 'test', value: '1', options: {} }]);
        options.cookies.setAll([]);
        return {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null } })
            }
        }
    })
}));

vi.mock('next/server', () => {
    return {
        NextResponse: {
            next: vi.fn(() => ({ cookies: { set: vi.fn() } })),
            redirect: vi.fn(() => ({})),
        },
        NextRequest: vi.fn(),
    }
});

describe('middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if user is missing and path is protected', async () => {
        const req = {
            headers: new Headers(),
            url: 'http://localhost/dashboard',
            nextUrl: { pathname: '/dashboard' },
            cookies: { getAll: vi.fn(), set: vi.fn() }
        } as unknown as NextRequest;

        await middleware(req);
        expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('proceeds normally if user is missing but path is not protected', async () => {
        const req = {
            headers: new Headers(),
            url: 'http://localhost/public',
            nextUrl: { pathname: '/public' },
            cookies: { getAll: vi.fn(), set: vi.fn() }
        } as unknown as NextRequest;

        await middleware(req);
        expect(NextResponse.next).toHaveBeenCalled();
    });
});
