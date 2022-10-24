import { buildSync } from 'esbuild';
export default () => {
  return {
    name: 'vite-plugin-bundle-worker',
    transform(_, id) {
      // if the file name end with '?worker'
      if (/\?worker/.test(id)) {
        // remove '?worker' from id
        id = id.replace(/\?[\w-]+/, '');
        // bundle the source code ( which resolves import/export )
        const code = buildSync({
          bundle: true,
          entryPoints: [id],
          minify: true,
          write: false, // required in order to retrieve the result code
        }).outputFiles[0].text;
        const url = this.emitFile({
          fileName: id.match(/[\w\.-\_\/]+\/([\w\.-\_]+)$/)[1], // get file name
          type: 'asset',
          source: code,
        });
        // now the file ends with '?worker' would be treated as a code which exports Worker constructor
        return `export default function(){
          return new Worker("__VITE_ASSET__${url}__")
        }`;
      }
    },
  };
};
