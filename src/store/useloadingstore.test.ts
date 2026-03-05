import { describe, it, expect, beforeEach } from 'vitest';
import { useLoadingStore } from './useloadingstore';

describe('useLoadingStore', () => {
    beforeEach(() => {
        useLoadingStore.setState({ isLoading: false, message: null });
    });

    it('is initially not loading', () => {
        expect(useLoadingStore.getState().isLoading).toBe(false);
        expect(useLoadingStore.getState().message).toBeNull();
    });

    it('startLoading sets true and default message', () => {
        useLoadingStore.getState().startLoading(undefined);
        expect(useLoadingStore.getState().isLoading).toBe(true);
        expect(useLoadingStore.getState().message).toBe('Brewing your data...');
    });

    it('startLoading sets custom message', () => {
        useLoadingStore.getState().startLoading('Wait!');
        expect(useLoadingStore.getState().message).toBe('Wait!');
    });

    it('stopLoading sets false and null message', () => {
        useLoadingStore.getState().startLoading();
        useLoadingStore.getState().stopLoading();
        expect(useLoadingStore.getState().isLoading).toBe(false);
        expect(useLoadingStore.getState().message).toBeNull();
    });
});
