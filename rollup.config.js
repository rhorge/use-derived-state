import { uglify } from 'rollup-plugin-uglify'
import typescript from 'rollup-plugin-typescript2'
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json'));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs'
    },
    {
      file: packageJson.module,
      format: 'esm'
    }
  ],
  plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__/**", "**/*.test.ts"]
        }
      }),
      uglify()
  ],
  external: ['react', 'react-dom'],
}
