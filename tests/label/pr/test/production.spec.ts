import { example } from '../production/production-code';

test('production code test', () => {
  expect(example()).toBe(1);
});
