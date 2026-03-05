import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
    it('does not render if totalPages is 1 or less', () => {
        const { container } = render(<Pagination totalCount={10} pageSize={10} currentPage={1} setCurrentPage={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders buttons and text correctly for middle page', () => {
        render(<Pagination totalCount={25} pageSize={10} currentPage={2} setCurrentPage={vi.fn()} />);
        expect(screen.getByText(/Showing/)).toBeInTheDocument();
        expect(screen.getByText('11')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('calls setCurrentPage on previous and next clicks', () => {
        const setPage = vi.fn();
        render(<Pagination totalCount={25} pageSize={10} currentPage={2} setCurrentPage={setPage} />);

        fireEvent.click(screen.getByText('Previous'));
        expect(setPage).toHaveBeenCalled();
        const updaterFn1 = setPage.mock.calls[0][0];
        expect(updaterFn1(2)).toBe(1);

        fireEvent.click(screen.getByText('Next'));
        const updaterFn2 = setPage.mock.calls[1][0];
        expect(updaterFn2(2)).toBe(3);
    });

    it('disables previous on page 1 and next on last page', () => {
        const { rerender } = render(<Pagination totalCount={25} pageSize={10} currentPage={1} setCurrentPage={vi.fn()} />);
        expect(screen.getByText('Previous')).toBeDisabled();
        expect(screen.getByText('Next')).not.toBeDisabled();

        rerender(<Pagination totalCount={25} pageSize={10} currentPage={3} setCurrentPage={vi.fn()} />);
        expect(screen.getByText('Previous')).not.toBeDisabled();
        expect(screen.getByText('Next')).toBeDisabled();
    });
});
