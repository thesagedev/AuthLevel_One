/**
 * Shared application types
 */

// Generic nullable value
export type Nullable<T> = T | null;

// Generic optional value
export type Optional<T> = T | undefined;

// Generic async return types
export type AsyncResult<T> = Promise<T>;
