import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PromoIdeaList } from './promoidealist';

vi.mock('./promoideacard', () => ({
    PromoIdeaCard: ({ idea }: { idea: any }) => <div data-testid="idea-card">{idea.theme}</div>,
}));

describe('PromoIdeaList', () => {
    it('renders empty state when no ideas and not loading', () => {
        render(<PromoIdeaList ideas={[]} loading={false} copiedIndex={null} onCopy={vi.fn()} />);
        expect(screen.getByText(/Generate your top 3 strategies for this week./)).toBeInTheDocument();
    });

    it('does not render empty state if loading', () => {
        const { container } = render(<PromoIdeaList ideas={[]} loading={true} copiedIndex={null} onCopy={vi.fn()} />);
        expect(screen.queryByText(/Generate your top 3 strategies/)).toBeNull();
    });

    it('does not render empty state if ideas exist AND loading', () => {
        const ideas = [{ theme: 'Idea 1' }] as any;
        render(<PromoIdeaList ideas={ideas} loading={true} copiedIndex={null} onCopy={vi.fn()} />);
        expect(screen.queryByText(/Generate your top 3 strategies/)).toBeNull();
    });

    it('renders list of ideas', () => {
        const ideas = [
            { theme: 'Idea 1' } as any,
            { theme: 'Idea 2' } as any,
        ];
        render(<PromoIdeaList ideas={ideas} loading={false} copiedIndex={null} onCopy={vi.fn()} />);
        expect(screen.getAllByTestId('idea-card')).toHaveLength(2);
        expect(screen.getByText('Idea 1')).toBeInTheDocument();
    });
});
