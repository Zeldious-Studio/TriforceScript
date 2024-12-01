# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-12-01

### Added
- Initial project setup with TypeScript configuration
- Core compiler implementation
- Command-line interface using Commander.js
- Build system with TypeScript compilation
- Development workflow with nodemon for hot-reloading
- Testing setup with Jest
- ESLint configuration for code quality
- Example files support with `tfs:example` command
- Core dependencies:
  - chalk for terminal coloring
  - commander for CLI handling
  - typescript for compilation
- Development tools:
  - Jest for testing
  - ESLint for code quality
  - Nodemon for development
  - Rimraf for clean builds

### Development Setup
- Added comprehensive npm scripts for development workflow:
  - `build`: TypeScript compilation
  - `start`: Run compiled code
  - `test`: Run Jest tests
  - `dev`: Development mode with nodemon
  - `lint`: ESLint checking
  - `tfs`: Build and run compiler
  - `tfs:watch`: Watch mode for development
  - `tfs:clean`: Clean build outputs
  - `tfs:example`: Run example files

### Changed

### Deprecated

### Removed

### Fixed

### Security
