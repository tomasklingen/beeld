# Agent Guidelines

This document provides a set of guidelines for agents working on this project. Adhering to these principles will ensure consistency, maintainability, and quality in the codebase.

## Package Manager

This project uses `pnpm` as the package manager. Please use `pnpm` for all dependency management tasks.

- To install dependencies: `pnpm install`
- To add a dependency: `pnpm add <package-name>`
- To add a dev dependency: `pnpm add -D <package-name>`
- To run a script: `pnpm <script-name>`

## Coding Style

We follow a strict and consistent coding style to ensure the codebase is readable and maintainable.

### TypeScript

- The entire codebase is written in TypeScript.
- **Strict Mode**: All code should be compliant with TypeScript's `strict` mode. This helps in catching potential errors at compile time.
- **No `any`**: Avoid using the `any` type. It defeats the purpose of TypeScript. If you need a flexible type, prefer `unknown` and perform type checking.

### SOLID Principles

Components and modules should be designed following the SOLID principles.

## Project Structure

The project follows the standard SvelteKit project structure. Here is a brief overview of the key directories:

- `src/`: Contains all the application source code.
  - `lib/`: For shared components, utilities, and modules.
    - `components/`: Reusable Svelte components.
    - `utils/`: Utility functions.
    - `views/`: Larger components that represent a full view or a significant part of a page.
  - `routes/`: This is where the file-based routing of SvelteKit is defined. Each file or directory here corresponds to a route in the application.
  - `app.html`: The main HTML template for the application.
- `static/`: For static assets that don't need to be processed by the build tool (e.g., `favicon.ico`, `robots.txt`).
- `tests/`: Contains all the tests for the application.
