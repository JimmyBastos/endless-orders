# Endless Orders API

A production-ready RESTful API for managing orders, built with TypeScript, Node.js, and PostgreSQL. This project exemplifies modern software engineering practices through comprehensive testing, error handling, and observability.

> **Note**: This project intentionally demonstrates engineering practices and architectural patterns. Some implementations may be considered over-engineered for a simple CRUD API, but they showcase technical skills, best practices, and scalable design patterns that would be valuable in larger, more complex systems.

## Features

- **Order Management**: Create, read, update, and cancel orders with items
- **Entity Validation**: Auto-validated entities with getters/setters enforcing business rules
- **Status Transitions**: Validated order status workflow (pending → processing → completed/cancelled)
- **Dependency Injection**: TSyringe-based DI container for loose coupling and testability
- **Repository Pattern**: Abstracted data access supporting PostgreSQL storage
- **Request Validation**: Zod schemas for type-safe input validation
- **Error Handling**: Centralized error middleware with structured error responses
- **Automated Testing**: Comprehensive test suite with unit and integration tests
- **Serialization**: Class-transformer for proper entity serialization in API responses

## Possible Improvements

- **Authentication**: Implement JWT-based authentication and authorization policies
- **Queues**: Implement asynchronous task queues with retries, backoff strategy and dead-letter queues. 
- **Deployment**: Add CI/CD pipeline for automated testing and release
- **Observability**: Enterprise logging (CloudWatch/ELK), production monitoring (Grafana/Datadog/Sentry).
- **Security**: JWT authentication, role-based access control, rate limiting, vulnerability scanning.
- **Scalability**: Redis caching for queries, database read replicas, connection pooling.

## Architecture Overview

The codebase is organized into distinct layers that promote separation of concerns and maintainability:

```
src/
├── entities/      # Domain models
├── services/      # Business logic layer
├── controllers/   # HTTP request handlers
├── repositories/  # Data access layer with Prisma
├── validators/    # Request validation schemas (Zod)
├── middlewares/   # Error handling, logging
└── errors/        # Custom error classes
```

## Technology Stack

**Core Technologies**:
- `Express.js` - Web framework
- `TypeScript` - Type-safe JavaScript
- `Prisma ORM` - Database abstraction
- `PostgreSQL` - Relational database
- `Zod` - Schema validation
- `Class Transformer` - Entity serialization
- `TSyringe` - Dependency injection

**Development Tools**:
- `Jest` - Testing framework
- `ESLint` - Code quality
- `Docker` - Containerization
- `Supertest` - HTTP testing

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.15.1
- PostgreSQL database

### Installation & Running

```bash
# Install dependencies
pnpm install

# Start PostgreSQL via Docker (optional)
pnpm run docker:up

# Configure database connection in .env
# DATABASE_URL="postgresql://user:password@localhost:54329/endlessdb?schema=public"

# Run migrations
pnpm run db:migrate

# Start server
pnpm run start:dev
```

The API runs at `http://localhost:3838`

**Database Commands**:
```bash
pnpm run db:generate           # Generate Prisma client
pnpm run db:migrate            # Create and apply migrations
pnpm run db:push               # Push schema changes (dev only)
pnpm run db:migrate:deploy     # Deploy migrations (production)
```

**Environment Variables**:
```env
DATABASE_URL="postgresql://user:password@localhost:54329/endlessdb?schema=public"
```

### API Specification

#### Postman (recommended)

https://www.postman.com/brancedev/workspace/shared/collection/25679769-88a5eba9-ed6c-4aee-a144-7e158c258dd2?action=share&source=copy-link&creator=25679769

#### Swagger

```bash
# Serve API documentation
npx http-server docs/api -p 8202 -o 
```

## Testing

```bash
# Run tests
pnpm run test

# Run with coverage report
pnpm run test:coverage

# Serve test coverage reports
npx http-server coverage/lcov-report -p 8201 -o
```

Tests include unit tests for entities/services and integration tests for API endpoints.

## Production Build

```bash
# Compile TypeScript
pnpm run build        

# Run production build
pnpm run start:build    
```

## Contributing

Contributions are welcome through the standard fork-and-pull-request workflow. Please ensure all tests pass and include appropriate test coverage for new functionality.

**Development Guidelines**:
- Follow existing code style and patterns
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure backward compatibility when possible

## License

This project is licensed under the ISC License.
