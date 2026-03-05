import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { callOpenRouter } from '@/src/lib/openrouter';
import { supabase } from '@/src/lib/supabase';

vi.mock('@/src/lib/openrouter', () => ({
    callOpenRouter: vi.fn(),
}));

vi.mock('@/src/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

describe('Chatbot API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles standard request successfully', async () => {
        const mockSelect = vi.fn().mockResolvedValue({ data: [{ name: 'TestUser', favorite: 'Latte' }] });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        (callOpenRouter as any).mockResolvedValue({ choices: [{ message: { content: 'Hello!' } }] });

        const req = new Request('http://localhost/api/chatbot', {
            method: 'POST',
            body: JSON.stringify({ message: 'Hi' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(supabase.from).toHaveBeenCalledWith('customers');
        expect(mockSelect).toHaveBeenCalledWith('name, favorite');
        expect(callOpenRouter).toHaveBeenCalled();
        expect(json).toEqual({ choices: [{ message: { content: 'Hello!' } }] });
    });

    it('handles errors gracefully by returning 500', async () => {
        const mockSelect = vi.fn().mockResolvedValue({ data: [] });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        (callOpenRouter as any).mockRejectedValue(new Error('OpenRouter API Outage'));

        const req = new Request('http://localhost/api/chatbot', {
            method: 'POST',
            body: JSON.stringify({ message: 'Failure Test' }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: 'OpenRouter API Outage' });
    });
});
