import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as loadEnv } from 'dotenv'

// Load environment variables from .env.local (and other .env files)
loadEnv({ path: '.env.local' })
loadEnv() // Also load .env if it exists

// Check for required environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL environment variable is required')
  console.error('💡 Please add your Supabase URL to .env.local file')
  console.error('📖 See SUPABASE_GRAPHQL_SETUP.md for detailed instructions')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
  console.error('💡 Please add your Supabase anon key to .env.local file')
  console.error('📖 See SUPABASE_GRAPHQL_SETUP.md for detailed instructions')
  process.exit(1)
}

const graphqlEndpoint = `${supabaseUrl}/graphql/v1`

console.log('🚀 GraphQL Codegen Configuration:')
console.log(`   Supabase URL: ${supabaseUrl}`)
console.log(`   GraphQL Endpoint: ${graphqlEndpoint}`)

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [graphqlEndpoint]: {
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
    },
  },
  documents: ['graphql/**/*.graphql', 'graphql/**/*.gql'],
  generates: {
    'graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        {
          'typescript-rtk-query': {
            importBaseApiFrom: '../store/api/baseApi',
            exportHooks: true,
          },
        },
      ],
    },
    'graphql/introspection.json': {
      plugins: ['introspection'],
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
}

export default config 