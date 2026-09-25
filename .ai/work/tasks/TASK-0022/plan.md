# Plan: TASK-0022 — Fullstack Remediation: Public Stone Types API and Dynamic Live Data Integration

## Objective
Eliminate all remaining hardcoded mock datasets on the storefront by adding the missing public `GET /api/v1/stone-types` endpoint on the backend and wiring the Home page, Catalog stone filter, and Category catalog to fetch live data from the backend.

## Steps
1. **API Contract (`docs/api/openapi.yaml`)**:
   - Add `GET /stone-types` returning list of `StoneType`.
2. **Backend Implementation (`apps/backend`)**:
   - Create `StoneTypeService.java` with `getActiveStoneTypes()`.
   - Create `StoneTypeController.java` (`@RestController @RequestMapping("/api/v1/stone-types")`).
   - Update `SecurityConfig.java` to permit `GET /api/v1/stone-types/**`.
   - Add `StoneTypeControllerTest.java`.
   - Verify `mvn test`.
3. **Frontend Integration (`apps/frontend`)**:
   - In `apps/frontend/src/lib/api.ts`, add `getStoneTypes(): Promise<StoneTypeDto[]>`.
   - In `apps/frontend/src/app/page.tsx`:
     - Replace hardcoded `INITIAL_SHOWCASE_PRODUCTS` and `CATEGORIES` with `useEffect` data loading from `getProducts({ size: 8 })` and `getCategories()`.
     - Render content-aware skeleton loading state.
   - In `apps/frontend/src/components/catalog/CatalogView.tsx`:
     - Load `stoneTypes` asynchronously via `getStoneTypes()` in `loadMeta()` alongside `getCategories()`.
   - In `apps/frontend/src/app/catalog/[categorySlug]/page.tsx`:
     - Fetch categories and resolve category metadata dynamically.
4. **Validation**:
   - Run `mvn test` in backend.
   - Run `npm run build` in frontend.
5. **Handoff & Merge**:
   - Write `.ai/work/tasks/TASK-0022/handoff.md`.
   - Commit, merge to `main`, remove worktree, update `registry.yaml` to `done`.
