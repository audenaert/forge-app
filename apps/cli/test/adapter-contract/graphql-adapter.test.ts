// GraphQL adapter contract run. Since every method throws NotWiredError,
// we use the "expectNotWired" mode of the shared contract: it walks the
// StorageAdapter method list and asserts each throws with the expected
// shape. When the real adapter lands, this file drops `expectNotWired`
// and becomes a real contract run.

import { GraphqlAdapter } from '../../src/index.js';
import { runAdapterContractTests } from './contract.js';

runAdapterContractTests({
  name: 'GraphqlAdapter (stub)',
  factory: async () => ({
    adapter: new GraphqlAdapter(),
    cleanup: async () => {
      /* nothing to clean up */
    },
  }),
  expectNotWired: true,
});
