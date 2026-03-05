import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PromoIdeaCard } from './promoideacard';

vi.mock('@/src/store/usetoaststore', () => ({
    useToastStore: () => ({ showToast: vi.fn() }),
}));

describe('PromoIdeaCard', () => {
    const idea = {
        theme: 'Morning Boost',
        best_time_window: '7AM',
        segment_description: 'Early Birds',
        why_now: 'Start the day',
        ready_message: 'Get your coffee!'
    };

    it('renders idea details', () => {
        render(<PromoIdeaCard idea={idea} index={0} isCopied={false} onCopy={vi.fn()} />);
        expect(screen.getByText('Morning Boost')).toBeInTheDocument();
        expect(screen.getByText('7AM')).toBeInTheDocument();
        expect(screen.getByText('Early Birds')).toBeInTheDocument();
        expect(screen.getByText('Start the day')).toBeInTheDocument();
    });

    it('calls onCopy on internal copy button click', () => {
        const onCopy = vi.fn();
        render(<PromoIdeaCard idea={idea} index={0} isCopied={false} onCopy={onCopy} />);

        const copyBtn = screen.getByTitle('Copy to Clipboard');
        fireEvent.click(copyBtn);
        expect(onCopy).toHaveBeenCalledWith('Get your coffee!', 0);
    });

    it('handles WhatsApp share mock on mobile', () => {
        const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        const userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('iPhone');
        render(<PromoIdeaCard idea={idea} index={0} isCopied={false} onCopy={vi.fn()} />);

        const shareBtn = screen.getByTitle('Share to WhatsApp');
        fireEvent.click(shareBtn);
        expect(windowSpy).toHaveBeenCalled();
        windowSpy.mockRestore();
        userAgentGetter.mockRestore();
    });
});
