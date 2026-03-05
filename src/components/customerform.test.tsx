import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomerForm } from './customerform';

describe('CustomerForm', () => {
    const defaultProps = {
        editingId: null,
        formData: { name: '', contact: '', favorite: '', tagsInput: '' },
        errors: {},
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
        onClickCancelEditButton: vi.fn(),
    };

    it('renders correctly in add mode', () => {
        render(<CustomerForm {...defaultProps} />);
        expect(screen.getByText('Add New Customer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Customer' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Cancel/ })).toBeNull();
    });

    it('renders correctly in edit mode', () => {
        render(<CustomerForm {...defaultProps} editingId="123" />);
        expect(screen.getByText('Edit Customer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });

    it('displays validation errors', () => {
        render(<CustomerForm {...defaultProps} errors={{ name: 'Name is required' }} />);
        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('triggers handleSubmit on submit button click', () => {
        const handleSubmit = vi.fn();
        render(<CustomerForm {...defaultProps} handleSubmit={handleSubmit} />);

        fireEvent.click(screen.getByRole('button', { name: 'Add Customer' }));
        expect(handleSubmit).toHaveBeenCalled();
    });

    it('calls onClickCancelEditButton', () => {
        const onClickCancelEditButton = vi.fn();
        render(<CustomerForm {...defaultProps} editingId="1" onClickCancelEditButton={onClickCancelEditButton} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancel/ }));
        expect(onClickCancelEditButton).toHaveBeenCalled();
    });

    it('handles input changes', () => {
        const handleChange = vi.fn();
        render(<CustomerForm {...defaultProps} handleChange={handleChange} />);
        fireEvent.change(screen.getByPlaceholderText('e.g. John Doe'), { target: { value: 'a' } });
        expect(handleChange).toHaveBeenCalled();
    });
});
