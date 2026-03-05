import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProtectedLayout from './layout';

vi.mock('@/src/components/loadingoverlay', () => ({ LoadingOverlay: () => <div data-testid="loading" /> }));
vi.mock('@/src/components/toast', () => ({ Toast: () => <div data-testid="toast" /> }));
vi.mock('@/src/components/topnav', () => ({ TopNav: () => <div data-testid="topnav" /> }));

describe('ProtectedLayout', () => {
    it('renders children and components', () => {
        render(<ProtectedLayout><div>Test Content</div></ProtectedLayout>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.getByTestId('toast')).toBeInTheDocument();
        expect(screen.getByTestId('topnav')).toBeInTheDocument();
    });
});
