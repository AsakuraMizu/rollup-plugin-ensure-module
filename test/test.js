const test = require('ava');
const { rollup } = require('rollup');

const ensureModule = require('../dist/index.js');

test('test', async t => {
  const options = {
    input: 'test/sample.js',
    plugins: [
      ensureModule()
    ]
  };

  const bundle = await rollup(options);
  const code = await bundle.generate({ format: 'cjs' });
  if (code.output[0].code.startsWith('const module = {};'))
    t.pass();
  else
    t.fail();
})