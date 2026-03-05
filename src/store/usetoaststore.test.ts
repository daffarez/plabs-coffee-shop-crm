import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToastStore } from './usetoaststore';

describe('useToastStore', () => {
    beforeEach(() => {
        useToastStore.setState({ isOpen: false, message: '', type: 'info' });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('is initially not open', () => {
        expect(useToastStore.getState().isOpen).toBe(false);
    });

    it('showToast sets state and hides after 3s', () => {
        useToastStore.getState().showToast('hello', 'success');
        expect(useToastStore.getState().isOpen).toBe(true);
        expect(useToastStore.getState().message).toBe('hello');
        expect(useToastStore.getState().type).toBe('success');

        vi.advanceTimersByTime(3000);
        expect(useToastStore.getState().isOpen).toBe(false);
    });

    it('showToast uses default info type', () => {
        useToastStore.getState().showToast('hello', undefined);
        expect(useToastStore.getState().type).toBe('info');
    });

    it('hideToast sets state immediately', () => {
        useToastStore.getState().showToast('hello');
        useToastStore.getState().hideToast();
        expect(useToastStore.getState().isOpen).toBe(false);
    });
});
