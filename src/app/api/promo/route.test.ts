import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { callOpenRouter } from '@/src/lib/openrouter';

vi.mock('@/src/lib/openrouter', () => ({
    callOpenRouter: vi.fn(),
}));

describe('Promo API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates promo themes successfully', async () => {
        const mockPromos = [
            {
                theme: 'Morning Brew',
                segment_description: 'Early Birds',
                why_now: 'Start the day right',
                ready_message: 'Get your morning coffee now!'
            }
        ];
        (callOpenRouter as any).mockResolvedValue(mockPromos);

        const req = new Request('http://localhost/api/promo', {
            method: 'POST',
            body: JSON.stringify({ tagCounts: { 'Latte': 5, 'Americano': 2 } }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(callOpenRouter).toHaveBeenCalled();
        expect(callOpenRouter).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ role: 'user' })]),
            true
        );
        expect(Array.isArray(json)).toBe(true);
        expect(json[0].theme).toBe('Morning Brew');
    });

    it('handles openrouter execution error gracefully', async () => {
        (callOpenRouter as any).mockRejectedValue(new Error('Generation completely failed'));

        const req = new Request('http://localhost/api/promo', {
            method: 'POST',
            body: JSON.stringify({ tagCounts: {} }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ error: 'Generation completely failed' });
    });
});
