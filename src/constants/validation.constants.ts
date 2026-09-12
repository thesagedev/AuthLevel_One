// Shared validation values used throughout the applications

export const VALIDATION = {
    EMAIL: {
        MAX_LENGTH: 254
    },
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30
    },
    DISPLAY_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128
    }
} as const;