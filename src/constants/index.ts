// API Configuration
export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Pagination & Grid Configuration
export const DEFAULT_PAGE_SIZE = 24;
export const MOBILE_PAGE_SIZE = 12;
export const DESKTOP_PAGE_SIZE = 30;

// Search & Debouncing
export const SEARCH_DEBOUNCE_MS = 400;

// Statistics Configuration
export const MIN_STAT_VALUE = 1;
export const MAX_STAT_VALUE = 255;
export const STAT_INPUT_MAX_LENGTH = 3;

// React Query Configuration
export const QUERY_RETRY_COUNT = 2;
export const QUERY_STALE_TIME_MS = 60_000; // 1 minute
export const QUERY_GC_TIME_MS = 1000 * 60 * 60; // 1 hour

// Resource-specific cache durations
// Stable lists (types, abilities, global name/id list) change rarely
export const STABLE_LIST_STALE_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pokemon details can change more often
export const POKEMON_DETAIL_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

// UI Configuration
export const SKELETON_LOADING_COUNT = 30;
export const MODAL_CLOSE_DELAY_MS = 200;

// Storage Keys
export const FAVORITES_STORAGE_KEY = "pokemon:favorites";

// Pokemon Generation Ranges
export const MIN_GENERATION = 1;
export const MAX_GENERATION = 9;

// Error Messages
export const ERROR_MESSAGES = {
  POKEMON_LIST_FETCH: "Failed to fetch Pokemon list",
  POKEMON_DETAIL_FETCH: "Failed to fetch Pokemon details",
  POKEMON_DETAIL_LOAD: "Failed to load Pokemon details. Please try again.",
  GENERIC_LOAD_FAIL: "Failed to load.",
  NETWORK_ERROR: "Network error occurred. Please check your connection.",
  API_ERROR: "API is currently unavailable. Please try again later.",
} as const;

// Loading States
export const LOADING_STATES = {
  LOADING: "Loading…",
  LOAD_MORE: "Load more",
  APPLYING: "Applying...",
  FETCHING: "Fetching...",
} as const;
