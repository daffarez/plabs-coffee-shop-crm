import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomerSearchFilters } from './customersearchfilter';

describe('CustomerSearchFilters', () => {
    it('renders inputs with values', () => {
        render(<CustomerSearchFilters searchInput="John" setSearchInput={vi.fn()} filterTag="Latte" setFilterTag={vi.fn()} />);
        expect(screen.getByPlaceholderText(/Search by name/)).toHaveValue('John');
        expect(screen.getByPlaceholderText(/Filter by interests/)).toHaveValue('Latte');
    });

    it('calls setters on change', () => {
        const setSearchInput = vi.fn();
        const setFilterTag = vi.fn();
        render(<CustomerSearchFilters searchInput="" setSearchInput={setSearchInput} filterTag="" setFilterTag={setFilterTag} />);

        fireEvent.change(screen.getByPlaceholderText(/Search by name/), { target: { value: 'Doe' } });
        expect(setSearchInput).toHaveBeenCalledWith('Doe');

        fireEvent.change(screen.getByPlaceholderText(/Filter by interests/), { target: { value: 'Brew' } });
        expect(setFilterTag).toHaveBeenCalledWith('Brew');
    });
});
