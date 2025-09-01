# Pokemon Explorer

A modern React application for exploring and filtering Pokemon data, built to handle the challenges of working with a complex API that doesn't support server-side filtering.

## What it does

- Search Pokemon by name, filter by type/generation/abilities/stats
- Sort by different criteria (name, stats, generation, etc.)
- Save favorites (stored locally)
- Shareable URLs for filters, search, and sort
- Works on mobile and desktop
- Handles 1300+ Pokemon without freezing your browser

## Tech I used

- React 19 + TypeScript + Tailwind CSS
- Vite for building
- TanStack Query for data fetching and caching
- React Context for favorites, React hooks for everything else
- Pokemon API (PokeAPI)
- Lucide React icons
- p-limit to control API request concurrency

## How it's organized - Project Architecture

The app is built around one main challenge: **the Pokemon API doesn't support filtering/sorting**. So I had to get creative with a client-side solution.

### Component structure

```
src/
├── App.tsx                         # Main app component
├── main.tsx                        # App entry point
├── components/
│   ├── PokemonGridChooser.tsx      # Routes between basic/filtered grids
│   ├── PokemonGridWithFilters.tsx  # Handles all filtering/sorting/search
│   ├── PokemonGrid.tsx             # Wrapper component
│   ├── PokemonGrid.mobile.tsx      # Mobile load-more pagination (unfiltered)
│   ├── PokemonGrid.desktop.tsx     # Simple pagination (unfiltered)
│   ├── PokemonFilters.tsx          # Filter UI components
│   ├── SortControls.tsx            # Sorting UI components
│   ├── HeavyOperationDialog.tsx    # Warns before expensive operations
│   ├── PokemonCard.tsx             # Individual Pokemon display
│   ├── PokemonCardInfo.tsx         # Pokemon details in card
│   ├── PokemonModal.tsx            # Pokemon detail modal
│   ├── PokemonLogo.tsx             # App logo component
│   ├── EmptyState.tsx              # Empty state display
│   ├── ErrorDisplay.tsx            # Error handling component
│   └── NotFound.tsx                # 404 component
├── api/
│   ├── filteredPokemonApi.ts       # Core filtering/sorting logic
│   ├── pokemonApi.ts               # Basic Pokemon data fetching
│   ├── usePokemonList.ts           # Hook for basic Pokemon list
│   ├── usePokemonDetails.ts        # Hook for Pokemon details
│   └── queryClient.ts              # TanStack Query configuration
├── hooks/
│   ├── useFilteredPokemon.ts       # Hook for filtered data
│   ├── useFavorites.ts             # Favorites management
│   ├── useFiltersAndSort.ts        # Filter state management
│   ├── useDebouncedValue.ts        # Debouncing utility
│   └── useIsMobile.ts              # Mobile detection
├── context/
│   └── FavoritesProvider.tsx       # React Context for favorites
├── constants/
│   └── index.ts                    # App constants (generations, types, etc.)
├── types/
│   └── pokemon.ts                  # TypeScript type definitions
└── utils/
    ├── filters.ts                  # Filter constants and utilities
    ├── favorites.ts                # Local storage helpers
    └── pokemon.ts                  # Pokemon utility functions
tests/
├── unit/
│   └── filters.test.ts             # Tests for filter utilities
├── integration/
│   └── PokemonGridWithFilters.int.test.tsx  # Integration tests
├── e2e/
│   └── modal.spec.ts               # End-to-end tests with Playwright
└── setup/
    ├── server.ts                   # MSW mock server setup
    └── setupTests.ts               # Test configuration
```

### Smart Grid Routing

The app uses a "hybrid" approach with `PokemonGridChooser` that automatically routes to **different APIs** based on what the user needs:

- **Basic grids** (PokemonGrid.mobile/desktop): When no filters/search/sorting is active
  - Uses **simple Pokemon API**: `/pokemon?offset=X&limit=Y`
  - Gets basic Pokemon data (id, name, image)
  - Fast and efficient for browsing
  - **Mobile version**: Load-more button (better for touch; preserves scroll position)
  - **Desktop version**: Previous/Next pagination (better for mouse/keyboard)

- **Filtered grid** (PokemonGridWithFilters): When any filters, search, or sorting is active
  - Uses **complex multi-API approach**: `/type/fire`, `/ability/blaze`, `/pokemon/1`, `/pokemon/2`, etc.
  - Fetches detailed Pokemon data with stats, abilities, types
  - Handles all the complex Pokemon API challenges
  - Shows warning dialog for expensive operations
  - **Responsive**: Automatically adapts mobile vs desktop behavior

**Why two different systems?** The basic grid hits a simple, fast API endpoint that gives you Pokemon in order. The filtered grid has to hit multiple different API endpoints and combine the data, which is much slower but gives you filtering/sorting capabilities.

**Why mobile vs desktop versions?** Different devices need different UX patterns:

- **Mobile**: Load-more works better for touch interaction and smaller screens
- **Desktop**: Previous/Next pagination is faster with mouse and works better for larger screens with more items visible

## The Pokemon API Challenge

### The Problem

The Pokemon API doesn't support combined filtering queries like you'd expect:

- `GET /pokemon?type=fire&generation=1` (not supported)
- `GET /pokemon?minAttack=100&sort=name` (not supported)

But it DOES support some individual filters:

1. **Get Pokemon by type**: `GET /type/fire` → returns all fire Pokemon IDs ✓
2. **Get Pokemon by ability**: `GET /ability/blaze` → returns Pokemon with that ability ✓
3. **Get Pokemon by generation**: Calculate from ID ranges (Gen 1: 1-151, etc.)
4. **Get details for each Pokemon**: `GET /pokemon/1`, `GET /pokemon/2`, etc.
5. **Filter by stats**: Client-side after fetching all details
6. **Sort**: Client-side

So the challenge is **combining multiple filters** and **sorting by stats** - that's where it gets expensive with potentially 1000+ API requests!

### Alternative Approach (Not Implemented)

There's actually one case where you could use a single API endpoint for some sorting:

- **For name or generation sorting only**: You could use `GET /pokemon?offset=0&limit=1500` to get all Pokemon names and IDs in order, then apply generation filtering by ID ranges
- **Fake pagination**: Since you have all the data, you could simulate pagination client-side
- **Problem**: This only works for name/generation sorting. The moment you want to sort by stats (attack, defense, etc.), you're back to fetching individual Pokemon details for each one

I decided against this approach because:

- It only solves a subset of the sorting problem
- You still need the complex multi-API system for stats-based sorting

### Our Solution Strategy

I built a multi-step optimization system to make this work efficiently:

#### 1. Smart Pre-filtering

```typescript
// Step 1: Get candidate Pokemon IDs using the fastest methods
async function getCandidateIds(filters: PokemonFilters) {
  // Types: API call to /type/{type}
  // Generations: Fast calculation using ID ranges (no API calls!)
  // Abilities: API call to /ability/{ability}

  // Combine using set operations (intersection/union)
  return candidateIds; // Reduced from 1300+ to maybe 50-200
}
```

#### 2. Name Search Pre-filtering

```typescript
// If searching by name, filter candidates BEFORE fetching details
if (searchTerm) {
  const allPokemon = await getAllPokemonList(); // One API call gets all names/IDs
  const nameMatches = allPokemon.filter((p) =>
    p.name.includes(searchTerm.toLowerCase())
  );
  candidateIds = candidateIds.filter((id) => nameMatches.has(id));
}
```

#### 3. Efficient Batch Fetching

```typescript
const limit = pLimit(20); // Limit concurrent requests
const detailPromises = candidateIds.map((id) =>
  limit(() => fetchPokemonDetails(id))
);
const results = await Promise.all(detailPromises);
```

#### 4. Memory & Performance Optimizations

- **Caching**: TanStack Query caches all API responses
- **Concurrency Control**: `p-limit` prevents browser from being overwhelmed
- **Debounced Search**: 400ms delay prevents API spam while typing
- **Heavy Operation Warnings**: Alerts users before expensive operations
- **Mobile Scroll Anchoring**: Prevents page jumping when loading more results

#### 5. Hardcoded Data for Performance

I decided to hardcode certain data instead of always hitting the API:

```typescript
// Generation ranges - these never change!
export const POKEMON_GENERATIONS = [
  { id: 1, name: "Generation I", range: [1, 151] },
  { id: 2, name: "Generation II", range: [152, 251] },
  // ...
];

// Common types and abilities - stable data
export const POKEMON_TYPES = ["fire", "water", "grass", ...];
export const COMMON_ABILITIES = ["blaze", "torrent", "overgrow", ...];
```

**Why hardcode?**

- Generation data is static and calculating from ID ranges is instant
- Types and abilities rarely change
- Avoids unnecessary API calls on every page load
- Provides better UX with immediate filter options

_Note: In a fullstack production project, I'd probably store this in a database and cache it properly rather than hardcoding in the frontend, but for this demo project it makes sense._

## Testing

I added some tests mainly to show I know how to write them, not because this demo project really needed comprehensive testing:

### What I Actually Tested

**Unit Tests (`tests/unit/filters.test.ts`)**

- **Filter utilities**: Testing `unionSets()`, `intersectAll()`, `intersectTwo()` - the set operations for combining Pokemon lists
- **URL parameter conversion**: Testing `filtersToURLParams()` and `urlParamsToFilters()` - for shareable filter URLs
- **Active filter detection**: Testing `hasActiveFilters()` - determines which grid to show
- **Constants validation**: Making sure Pokemon types and generations are defined correctly

_Why these?_ These cover core data transformations and URL/state handling that power filtering and sorting—fast, deterministic checks that catch regressions early.

**Integration Test (`tests/integration/PokemonGridWithFilters.int.test.tsx`)**

- **Complete filtering workflow**: Tests that filtering by fire type works end-to-end
- **API mocking with MSW**: Shows I know how to mock API responses for testing
- **Error handling**: Tests graceful failures when API calls don't work

_Why this?_ Wanted to show I can write integration tests that test multiple parts working together, plus demonstrate MSW usage.

**E2E Test (`tests/e2e/modal.spec.ts`)**

- **Pokemon modal interactions**: Tests clicking a Pokemon card opens the detail modal correctly
- **Real browser testing**: Uses Playwright to test the actual user experience

_Why this?_ Mainly to show I know how to set up Playwright and write E2E tests. The modal seemed like a simple interaction to test.

### Tests I Would Add in a Real Project

**More Unit Tests:**

- **Search logic**: Test name filtering and normalization
- **Pokemon data conversion**: Test `convertToEnhancedPokemon()` transformation
- **Generation calculation**: Test ID range calculations for different generations
- **Set operations edge cases**: Test empty sets, single items, large datasets

**More Integration Tests:**

- **Combined filters**: Test type + generation + abilities together
- **Search + filters**: Test searching "char" while filtering by fire type
- **Cache behavior**: Test TanStack Query caching works correctly
- **Mobile vs desktop**: Test different behaviors on different screen sizes

**More E2E Tests:**

- **Complete user workflows**: Search → filter → sort → favorite → modal
- **Filter combinations**: Select multiple types, change sort order, verify results
- **Mobile interactions**: Test load-more pagination doesn't break with filters
- **Favorites persistence**: Add favorites, refresh page, verify they're still there
- **Heavy operation warnings**: Test dialog appears for expensive operations

**Performance Tests:**

- **Memory usage**: Test filtering 1000+ Pokemon doesn't cause memory leaks
- **API rate limiting**: Test concurrent request limiting works under load
- **Scroll performance**: Test load-more remains smooth with many items

**Accessibility Tests:**

- **Keyboard navigation**: Test all interactions work with keyboard only
- **Screen reader compatibility**: Test ARIA labels and announcements
- **Focus management**: Test focus moves correctly in modals and filters

## Key Technical Decisions

### 1. **Two-Grid System (Different APIs)**

Instead of one complex component, I split into basic (fast API) and filtered (complex multi-API) grids:

- **Basic grid**: Hits `/pokemon?offset=X&limit=Y` - one simple API call
- **Filtered grid**: Hits `/type/fire`, `/ability/blaze`, `/pokemon/1`, `/pokemon/2`, etc. - many API calls

This keeps the common case (just browsing Pokemon) super fast, while handling complex filtering separately when needed.

### 2. **Client-Side Filtering Over Server Proxy**

I chose to apply for frontend positions, so I built a client-side solution. However, a **fullstack approach would definitely be better** for performance:

- Backend could handle the 1000+ API calls server-side
- Users would get filtered results much faster
- Less browser resource usage
- Better for SEO and initial page loads

For a frontend-only solution, client-side filtering made sense because:

- No backend infrastructure needed
- Leverages browser caching
- Limited offline resilience via browser cache
- Simpler deployment (static hosting)

### 3. **Favorites in LocalStorage**

Used localStorage instead of a database because:

- No user accounts needed
- Works offline
- Good enough for personal favorites

### 4. **TanStack Query Over SWR**

Chose TanStack Query because:

- Better error handling and retry logic
- More powerful caching options
- Built-in loading states
- Better TypeScript support

**SWR** is another popular data fetching library for React, similar to TanStack Query, but with a simpler API. I chose TanStack Query for its more advanced features.

### 5. **p-limit for Concurrency**

Used p-limit to control concurrent requests because:

- Prevents browser from being overwhelmed
- Avoids potential rate limiting from Pokemon API
- Keeps UI responsive during heavy operations
- Simple to implement and understand

## Performance Optimizations

### 1. **Smart Caching Strategy**

- Pokemon details cached for 5 minutes
- Type/ability listings cached for 24 hours (stable data)
- Global Pokemon name/id list cached for 24 hours
- Browser HTTP cache for images

### 2. **Efficient Data Flow**

```
User selects "Fire" type
  ↓
Get all fire Pokemon IDs (1 API call)
  ↓
Get details for ~70 fire Pokemon (70 API calls, batched with p-limit)
  ↓
Filter by stats client-side (instant)
  ↓
Sort results client-side (instant, but not optimally - could be improved)
  ↓
Paginate for display (instant)
```

### 3. **Mobile Optimizations**

- Smaller page sizes (12 vs 30 items)
- Load-more on mobile vs pagination on desktop
- Scroll position anchoring during "Load More"
- Touch-friendly interface

### 4. **Bundle Optimizations**

- Tree-shaking with Vite
- Code splitting (though limited in this SPA)
- Optimized Tailwind CSS
- Compressed production builds

## What This Project Demonstrates

### Problem-Solving Skills

- Identified the core API limitation and designed a comprehensive solution
- Balanced performance vs functionality tradeoffs
- Built user-friendly warnings for expensive operations

### React/TypeScript Knowledge

- Complex state management with multiple hooks
- Type-safe API integration
- Performance optimization with React patterns
- Custom hooks for reusable logic

### API Integration

- Working with challenging third-party APIs
- Error handling and retry logic
- Efficient data fetching strategies
- Caching and performance optimization

### UX/UI Design

- Responsive design that works on all devices
- Progressive enhancement (basic → filtered functionality)
- Loading states and error handling
- Accessible components with proper ARIA labels

### Architecture & Planning

- Clean separation of concerns
- Scalable folder structure
- Consistent naming conventions
- Documentation and code comments

## Future Improvements

### Performance

- Add service worker for offline functionality
- Implement virtual scrolling for huge lists
- Add request cancellation for rapid filter changes
- Consider WebAssembly for heavy sorting operations

### Features

- Advanced filtering (e.g., multiple disjoint stat ranges, exact type matching)
- Pokemon comparison mode
- Export favorites list
- Battle simulation

### Technical

- Add comprehensive test suite
- Implement error boundaries
- Add analytics/monitoring
- Progressive Web App features
- Consider backend for user accounts

## Getting Started

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes for Code Review

This project showcases real-world problem solving where the external API (Pokemon API) doesn't support the features users need. Instead of giving up or building a complex backend, I designed a good client-side solution that:

1. **Minimizes API calls** through strategic pre-filtering
2. **Handles edge cases** like network errors and rate limiting
3. **Provides good UX** with loading states and performance warnings
4. **Scales efficiently** from 10 to 1000+ Pokemon
5. **Keeps code clean** despite complex data flow requirements

The result is a fast, reliable Pokemon explorer that feels like it has a custom API built just for filtering and searching Pokemon data.
