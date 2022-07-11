import { transform } from '@babel/core';
import TypeScriptToTypePlugin from '../modules/transformer/transformer-plugin';
describe('main entry', () => {
  it.skip('should work', () => {
    const result = transform('const a = 1;', {
      plugins: [TypeScriptToTypePlugin],
      filename: 'test.ts',
    });
  });
});
