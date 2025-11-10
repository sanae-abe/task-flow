/**
 * Conditional Apollo Provider
 *
 * Only loads Apollo Client when AI features are actually needed.
 * This removes ~34KB (gzip) from the critical path.
 *
 * Usage:
 * - Wrap components that use AI features with this provider
 * - Import lazily when needed: lazy(() => import('./contexts/ConditionalApolloProvider'))
 */

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../lib/apollo-client';

interface ConditionalApolloProviderProps {
  children: ReactNode;
}

/**
 * Apollo Provider wrapper for AI features
 *
 * Currently AI features (useAITaskCreation, useAIRecommendations) are not used
 * in the main app, so this provider is not loaded by default.
 *
 * When AI features are enabled, wrap the relevant components with this provider.
 */
export function ConditionalApolloProvider({
  children,
}: ConditionalApolloProviderProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}

export default ConditionalApolloProvider;
