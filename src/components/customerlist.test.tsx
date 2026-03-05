import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomerList } from './customerlist';

describe('CustomerList', () => {
    const defaultProps = {
        customers: [],
        isFetching: false,
        onClickEditButton: vi.fn(),
        onClickDeleteButton: vi.fn(),
        totalCount: 0,
        pageSize: 10,
        currentPage: 1,
        setCurrentPage: vi.fn(),
    };

    it('renders empty state properly', () => {
        render(<CustomerList {...defaultProps} />);
        expect(screen.getByText(/No customers found/)).toBeInTheDocument();
    });

    it('renders loading state indicator', () => {
        render(<CustomerList {...defaultProps} isFetching={true} />);
        expect(screen.getByText('Updating list...')).toBeInTheDocument();
    });

    it('renders customer data correctly', () => {
        const customers = [
            { id: '1', name: 'John Doe', contact: '12345', favorite: 'Latte', customer_tags: [{ interest_tags: { name: 'sweet' } }] }
        ];
        render(<CustomerList {...defaultProps} customers={customers as any} totalCount={1} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('12345')).toBeInTheDocument();
        expect(screen.getByText('Latte')).toBeInTheDocument();
        expect(screen.getByText('sweet')).toBeInTheDocument();
    });

    it('calls action callbacks', () => {
        const customers = [{ id: '1', name: 'John', contact: null, favorite: null, customer_tags: [] }];
        const onClickEditButton = vi.fn();
        const onClickDeleteButton = vi.fn();

        render(<CustomerList {...defaultProps} customers={customers as any} onClickEditButton={onClickEditButton} onClickDeleteButton={onClickDeleteButton} />);

        fireEvent.click(screen.getByTitle('Edit'));
        expect(onClickEditButton).toHaveBeenCalledWith(customers[0]);

        fireEvent.click(screen.getByTitle('Delete'));
        expect(onClickDeleteButton).toHaveBeenCalledWith(customers[0]);
    });

    it('renders multiple tags and shows overflow', () => {
        const customers = [
            { id: '1', name: 'John', contact: null, favorite: null, customer_tags: [{ interest_tags: { name: 'a' } }, { interest_tags: { name: 'b' } }, { interest_tags: { name: 'c' } }] }
        ];
        render(<CustomerList {...defaultProps} customers={customers as any} />);
        expect(screen.getByText('+1')).toBeInTheDocument();
    });
});
