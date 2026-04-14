import type { CodegenConfig } from '@graphql-codegen/cli';

const endpoint = process.env.CODEGEN_API_URL ?? 'http://localhost:4000/graphql';
const apiKey = process.env.CODEGEN_API_KEY ?? 'seed-dev-key';

const config: CodegenConfig = {
  schema: [
    {
      [endpoint]: {
        headers: {
          'x-api-key': apiKey,
        },
      },
    },
  ],
  documents: ['src/**/*.{ts,tsx,graphql}'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'documentNode',
        useTypeImports: true,
      },
    },
  },
};

export default config;
