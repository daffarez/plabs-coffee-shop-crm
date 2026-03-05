import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './statcard';
import { Coffee } from 'lucide-react';

describe('StatCard', () => {
    it('renders title and children', () => {
        render(<StatCard title="Total Customers" icon={Coffee} iconColorClass={undefined} bgColorClass={undefined} badgeColorClass={undefined} isRelative={undefined}>1234</StatCard>);
        expect(screen.getByText('Total Customers')).toBeInTheDocument();
        expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('renders badge text if provided', () => {
        render(
            <StatCard title="Revenue" icon={Coffee} badgeText="+5%">
                $1000
            </StatCard>
        );
        expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('renders correctly with isRelative flag', () => {
        const { container } = render(
            <StatCard title="Relative" icon={Coffee} isRelative>
                Test
            </StatCard>
        );
        expect(container.firstChild).toHaveClass('relative', 'overflow-hidden');
    });
});
