import { ApolloClient, InMemoryCache, DefaultOptions, createHttpLink } from '@apollo/client';

export const getBaseURL = () => {
  // Check for development environment
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // For production, use environment variables if available
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // Fallback to hardcoded domains in order of preference
  const productionDomains = [
    "https://assistly-psi.vercel.app",
    "https://assistly-75sl4u0k3-shimaa95s-projects.vercel.app",
    
  ];
  
  // Return the first domain (primary production domain)
  return productionDomains[0];
};

// Then use it in your Apollo client
const httpLink = createHttpLink({
  uri: `${getBaseURL()}/api/graphql`,
});

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  mutate: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
});

export default client;