import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd(), 'question/FrontEnd');
(async function () {
  let json = {};

  const dirs = (await fs.readdir(path.resolve(root))) || [];

  for (const dir of dirs) {
    const stat = await fs.lstat(path.resolve(root, dir));
    if (stat.isDirectory()) {
      const files = await fs.readdir(path.resolve(root, dir));
      json[dir] = {};
      for (const file of files) {
        let content = await fs.readFile(path.resolve(root, dir, file), 'utf8');
        content = content.replace(/\r/g, '');

        if (/answer/.test(file)) {
          json[dir]['answer'] = content;
        } else if (/index.mjs/.test(file)) {
          json[dir]['index'] = content;
        } else if (/index.md/.test(file)) {
          json[dir]['introduce'] = content;
          const desc = (content.match(/\n\n(.+)\n\n/) || [])[1];
          json[dir]['desc'] = desc;
        } else if (/test/.test(file)) {
          json[dir]['test'] = content;
        }
      }
    }
  }

  const dataPath = path.resolve(
    process.cwd(),
    'server/src/qsdata/questions.json'
  );
  await fs.writeFile(dataPath, JSON.stringify(json));
})();
