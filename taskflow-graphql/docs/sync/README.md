# TODO.md Sync System Documentation

This directory contains comprehensive documentation for the TODO.md synchronization system in TaskFlow.

## Overview

The TODO.md sync system enables bidirectional synchronization between a Markdown TODO file and the TaskFlow application, allowing seamless task management across different interfaces.

## Documentation Index

### User Documentation

- **[User Guide](USER_GUIDE.md)** - Quick start, file format, and best practices
  - Getting started with TODO.md sync
  - File format specification
  - MCP tool usage examples
  - Conflict resolution workflows
  - Tips and tricks

### Technical Documentation

- **[Architecture](ARCHITECTURE.md)** - System design and component overview
  - System architecture diagram
  - Component responsibilities
  - Data flow explanation
  - 3-way merge algorithm
  - Security measures

- **[API Reference](API_REFERENCE.md)** - Developer API documentation
  - MCP `todo_sync` tool specification
  - SyncCoordinator public API
  - ThreeWayMerger API
  - ConflictResolver API
  - Configuration options

### Operations Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Setup and configuration
  - Environment setup
  - MCP server configuration
  - Authentication setup
  - File watcher configuration
  - Monitoring and logging

- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions
  - Common error scenarios
  - Debug logging
  - Performance tuning
  - Recovery procedures

## Quick Links

### For End Users
- [Quick Start](USER_GUIDE.md#quick-start) - Get up and running in 5 minutes
- [TODO.md Format](USER_GUIDE.md#file-format) - Learn the file syntax
- [Sync Actions](USER_GUIDE.md#sync-actions) - Available sync operations

### For Developers
- [Architecture Overview](ARCHITECTURE.md#overview) - Understand the system design
- [API Examples](API_REFERENCE.md#examples) - Code samples
- [Security Model](ARCHITECTURE.md#security) - Security implementation details

### For DevOps
- [Deployment Checklist](DEPLOYMENT.md#checklist) - Pre-deployment verification
- [Monitoring Setup](DEPLOYMENT.md#monitoring) - Metrics and alerts
- [Backup Strategy](DEPLOYMENT.md#backup) - Data protection

## System Requirements

- Node.js 18+
- TypeScript 5+
- TaskFlow GraphQL server running
- File system access for TODO.md

## Key Features

- **Bidirectional Sync**: Changes flow both ways between file and app
- **Conflict Detection**: Automatic detection and resolution of conflicts
- **3-Way Merge**: Sophisticated merge algorithm prevents data loss
- **Security**: Path validation, XSS prevention, authentication
- **Performance**: Differential sync, batch operations, caching
- **MCP Integration**: Claude Code/Desktop integration via Model Context Protocol

## Support

For issues or questions:
- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review [Implementation Plan](../TODO_MD_SYNC_IMPLEMENTATION_PLAN.md)
- See integration tests in `src/sync/__tests__/`

## Version

Documentation Version: 1.0
Last Updated: 2025-11-09
System Version: Phase 5 (Complete)
