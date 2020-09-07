import MagicString from 'magic-string';
import { createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';

const ENSURE_STATEMENT = 'const module = {};\n';

export default function ensureModule(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'ensure-module',
    renderChunk(code, chuck) {
      const id = chuck.fileName;
      if (!filter(id)) return null;

      let ast = null;
      try {
        ast = this.parse(code);
      } catch (err) {
        this.warn({
          code: 'PARSE_ERROR',
          message: `rollup-plugin-ensure-module: failed to parse ${id}. Consider restricting the plugin to particular files via options.include`
        });
      }
      if (!ast) {
        return null;
      }

      let flag = false;

      walk(ast, {
        enter(node) {
          if (node.type == 'Identifier' && node.name == 'module') {
            flag = true;
          }
        }
      });

      if (!flag) return null;

      const magicString = new MagicString(code);
      magicString.prepend(ENSURE_STATEMENT);

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    }
  }
}
