# Implementation Plan: LocalForage Migration System

## Overview

This plan implements a migration system for LocalForage data in Graph Explorer.
The system runs before atom initialization to transform persisted user data when
data structures change between versions.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - [ ] 1.1 Add `localforage-driver-memory` dev dependency for testing
    - Run: `pnpm add -D localforage-driver-memory --filter graph-explorer`
    - _Requirements: Testing Strategy_
  - [ ] 1.2 Create migrations directory structure
    - Create `src/core/StateProvider/migrations/` directory
    - Create `types.ts`, `index.ts`, `registry.ts` files
    - _Requirements: 9.1, 9.4_

- [ ] 2. Implement core migration types and utilities
  - [ ] 2.1 Implement MigrationOptions interface and migrationOptions helper
    - Define `MigrationOptions` interface with `migrationKey` and `migrationFn`
    - Define `MigrationContext` interface with `get`, `set`, `remove` methods
    - Implement `migrationOptions()` helper function
    - _Requirements: 9.1, 9.2, 9.3, 5.1, 5.2, 5.3, 5.4_
  - [ ] 2.2 Implement MigrationHistory type and storage key constant
    - Define `MigrationHistory` interface with
      `completedMigrations: Set<string>`
    - Define `MIGRATION_HISTORY_KEY` constant
    - _Requirements: 1.1_
  - [ ]\* 2.3 Write unit tests for migration types
    - Test that `migrationOptions()` returns the input unchanged
    - _Requirements: 9.1_

- [ ] 3. Implement migration history management
  - [ ] 3.1 Implement getMigrationHistory function
    - Read migration history from LocalForage
    - Return null if no history exists
    - _Requirements: 1.3_
  - [ ] 3.2 Implement recordMigration function
    - Add migration key to completedMigrations set
    - Persist updated history to LocalForage
    - _Requirements: 1.2_
  - [ ] 3.3 Implement recordAllMigrations function
    - Mark all migrations as complete without executing
    - Used for fresh installations
    - _Requirements: 2.1_
  - [ ]\* 3.4 Write unit tests for migration history functions
    - **Property 1: Migration History Round-Trip**
    - **Validates: Requirements 1.4**
    - Test getMigrationHistory returns null when no history
    - Test getMigrationHistory returns stored history
    - Test recordMigration adds key to history
    - Test recordAllMigrations marks all complete
    - _Requirements: 1.2, 1.3, 1.4, 2.1_

- [ ] 4. Implement user data detection
  - [ ] 4.1 Implement hasUserData function
    - Use `localForage.keys()` to get all keys
    - Return true if any key exists other than migration history key
    - _Requirements: 2.1, 2.2, 6.1_
  - [ ]\* 4.2 Write unit tests for hasUserData
    - Test returns false when storage is empty
    - Test returns false when only migration history exists
    - Test returns true when user data exists
    - _Requirements: 2.1, 6.1_

- [ ] 5. Implement migration execution logic
  - [ ] 5.1 Implement createMigrationContext function
    - Create context object with get, set, remove methods
    - Wrap LocalForage operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 5.2 Implement getPendingMigrations function
    - Filter migrations not in history
    - Maintain registry order
    - _Requirements: 4.1, 4.2_
  - [ ] 5.3 Implement validateMigrations function
    - Check for duplicate migration keys
    - Throw error if duplicates found
    - _Requirements: 9.5_
  - [ ] 5.4 Implement executeMigration function
    - Run migration function with context
    - Record migration on success
    - Log execution for debugging
    - Do not record on failure
    - _Requirements: 1.2, 7.1, 7.3_
  - [ ]\* 5.5 Write unit tests for migration execution
    - **Property 2: Successful Migration Recording**
    - **Validates: Requirements 1.2**
    - **Property 3: Failed Migration Not Recorded**
    - **Validates: Requirements 7.1**
    - **Property 8: Migration Context Operations**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - **Property 9: Duplicate Migration Key Rejection**
    - **Validates: Requirements 9.5**
    - Test context.get returns stored value
    - Test context.set stores value
    - Test context.remove deletes key
    - Test successful migration is recorded
    - Test failed migration is not recorded
    - Test duplicate keys throw error
    - _Requirements: 1.2, 5.1, 5.2, 5.3, 5.4, 7.1, 9.5_

- [ ] 6. Implement main runMigrations function
  - [ ] 6.1 Implement runMigrations function
    - Validate migrations for duplicates
    - Check if user data exists
    - If no data: record all migrations as complete, return
    - If data exists: get history, get pending, execute pending in order
    - Log migration activity
    - _Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 7.3, 8.1_
  - [ ]\* 6.2 Write unit tests for runMigrations
    - **Property 4: Fresh Installation Behavior**
    - **Validates: Requirements 2.1**
    - **Property 5: Legacy Data Full Migration**
    - **Validates: Requirements 3.2**
    - **Property 6: Partial History Pending Execution**
    - **Validates: Requirements 1.3, 4.1, 4.2**
    - **Property 7: Data Preservation**
    - **Validates: Requirements 3.3**
    - Test fresh install marks all complete without executing
    - Test legacy data executes all migrations in order
    - Test partial history executes only pending
    - Test all complete skips execution
    - Test data not touched by migration is preserved
    - _Requirements: 1.3, 2.1, 3.2, 3.3, 4.1, 4.2_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integrate with storageAtoms
  - [ ] 8.1 Update storageAtoms.ts to call runMigrations
    - Import runMigrations from migrations module
    - Call runMigrations() before atom creation
    - Handle errors appropriately
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 8.2 Create empty migration registry
    - Export empty migrations array from registry.ts
    - Ready for future migrations to be added
    - _Requirements: 9.4_
  - [ ] 8.3 Export public API from migrations module
    - Export `migrationOptions` helper
    - Export types for external use
    - _Requirements: 9.1_

- [ ] 9. Update test infrastructure
  - [ ] 9.1 Update setupTests.ts to use localforage-driver-memory
    - Replace Map-based mock with memory driver
    - Configure LocalForage to use memory driver in tests
    - _Requirements: Testing Strategy_

- [ ] 10. Update steering documentation
  - [ ] 10.1 Create migrations steering file
    - Create `.kiro/steering/migrations.md`
    - Document when to add migrations
    - Document how to add migrations
    - Include common patterns and best practices
    - _Requirements: Developer Guide_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The migration registry starts empty - migrations are added as needed
