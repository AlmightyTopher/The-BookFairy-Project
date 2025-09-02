# Release Process

## Checklist
- [ ] Bump version in package.json
- [ ] Update CHANGELOG.md with new features and fixes
- [ ] Ensure all tests pass: `npm test`
- [ ] Ensure linting passes: `npm run lint`
- [ ] Ensure type checking passes: `npm run typecheck`
- [ ] Tag release: `git tag vX.Y.Z`
- [ ] Push tags: `git push origin --tags`
- [ ] Ensure CI is green on main branch
- [ ] Draft GitHub Release with highlights
- [ ] Update deployment documentation if needed

## Version Numbering
- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes
- MINOR: New features, backwards compatible
- PATCH: Bug fixes, backwards compatible

## Release Notes Template
```
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features go here

### Changed  
- Changes to existing functionality

### Fixed
- Bug fixes

### Security
- Security improvements
```
