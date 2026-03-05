import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    }),
}))

global.fetch = vi.fn()

global.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
}

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
