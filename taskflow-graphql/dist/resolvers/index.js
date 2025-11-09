/**
 * GraphQL Resolvers Index
 * Centralized resolver exports for TaskFlow GraphQL API
 */
import { GraphQLScalarType, Kind } from 'graphql';
import { taskQueries, taskMutations, taskFieldResolvers, taskSubscriptions, } from './task-resolvers.js';
import { boardQueries, boardMutations, boardFieldResolvers, boardSubscriptions, } from './board-resolvers.js';
import { labelQueries, labelMutations, labelFieldResolvers, } from './label-resolvers.js';
import { templateQueries, templateMutations, templateFieldResolvers, } from './template-resolvers.js';
import { markdownQueries, markdownMutations } from './markdown-resolvers.js';
import { webhookQueries, webhookMutations } from './webhook-resolvers.js';
import { geolocationResolvers } from './geolocation-resolvers.js';
// ============================================================================
// Custom Scalar Types
// ============================================================================
/**
 * DateTime scalar type (ISO 8601 string)
 */
const DateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'ISO 8601 date-time string (e.g., "2025-11-08T10:30:00Z")',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            return value;
        }
        throw new Error('DateTime must be a Date object or ISO 8601 string');
    },
    parseValue(value) {
        if (typeof value === 'string') {
            return value;
        }
        throw new Error('DateTime must be an ISO 8601 string');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return ast.value;
        }
        throw new Error('DateTime must be an ISO 8601 string literal');
    },
});
/**
 * JSON scalar type
 */
const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON data',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        switch (ast.kind) {
            case Kind.STRING:
            case Kind.BOOLEAN:
                return ast.value;
            case Kind.INT:
            case Kind.FLOAT:
                return parseFloat(ast.value);
            case Kind.OBJECT:
                return ast.fields.reduce((acc, field) => {
                    acc[field.name.value] = JSONScalar.parseLiteral(field.value);
                    return acc;
                }, {});
            case Kind.LIST:
                return ast.values.map(value => JSONScalar.parseLiteral(value));
            default:
                return null;
        }
    },
});
// ============================================================================
// Resolver Map
// ============================================================================
export const resolvers = {
    // Custom Scalars
    DateTime: DateTimeScalar,
    JSON: JSONScalar,
    // Queries
    Query: {
        ...taskQueries,
        ...boardQueries,
        ...labelQueries,
        ...templateQueries,
        ...markdownQueries,
        ...webhookQueries,
        ...geolocationResolvers.Query,
    },
    // Mutations
    Mutation: {
        ...taskMutations,
        ...boardMutations,
        ...labelMutations,
        ...templateMutations,
        ...markdownMutations,
        ...webhookMutations,
    },
    // Subscriptions
    Subscription: {
        ...taskSubscriptions,
        ...boardSubscriptions,
    },
    // Type Resolvers
    Task: taskFieldResolvers,
    Board: boardFieldResolvers,
    Label: labelFieldResolvers,
    Template: templateFieldResolvers,
};
export default resolvers;
//# sourceMappingURL=index.js.map