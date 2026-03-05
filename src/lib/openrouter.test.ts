import { vi, describe, it, expect, beforeEach } from 'vitest';
import { callOpenRouter } from './openrouter';

describe('openrouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls fetch with correct arguments and handles JSON format', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '1' }),
        });

        const res = await callOpenRouter([{ role: 'user', content: 'hello' }], true);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://openrouter.ai/api/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o-mini',
                    messages: [{ role: 'user', content: 'hello' }],
                    response_format: { type: 'json_object' },
                }),
            })
        );
        expect(res).toEqual({ id: '1' });
    });

    it('calls fetch correctly without JSON format', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '2' }),
        });

        const res = await callOpenRouter([{ role: 'user', content: 'hello' }], undefined);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://openrouter.ai/api/v1/chat/completions',
            expect.objectContaining({
                body: expect.stringContaining('"openai/gpt-4o-mini"'),
            })
        );
        expect(res).toEqual({ id: '2' });
    });

    it('throws an error if response is not ok', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Failed to complete' } }),
        });

        await expect(callOpenRouter([])).rejects.toThrow('Failed to complete');
    });

    it('throws an error if response is not ok and no message provided', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({}),
        });

        await expect(callOpenRouter([])).rejects.toThrow('OpenRouter API Error');
    });
});
