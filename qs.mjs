import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd(), 'question/FrontEnd');

(async function () {
  const dirs = (await fs.readdir(path.resolve(root))) || [];

  const qss = [];

  for (const dir of dirs) {
    const stat = await fs.lstat(path.resolve(root, dir));
    if (stat.isDirectory() && dir !== 'template') {
      const files = await fs.readdir(path.resolve(root, dir));
      const data = {};
      let contents = '';

      for (const file of files) {
        let content = await fs.readFile(path.resolve(root, dir, file), 'utf8');
        content = content.replace(/\r/g, '');
        contents += content;
        if (/answer.md/.test(file)) {
          data['answermd'] = content;
        } else if (/answer.mjs/.test(file)) {
          data['answer'] = content;
        } else if (/index.mjs/.test(file)) {
          data['template'] = content;
        } else if (/index.md/.test(file)) {
          data['introduce'] = content;
          const desc = (content.match(/(.+)\n\n/) || [])[1];
          data['desc'] = desc || '';
        } else if (/test/.test(file)) {
          data['test'] = content;
        }

        data['type'] = 1;
        data['level'] = 1;
        data['name'] = dir;
      }
      qss.push(data);
    }
  }
  await fs.writeFile('./server/qs.json', JSON.stringify({ data: qss }), {
    encoding: 'utf8',
  });
})();
