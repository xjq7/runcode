import fs from 'fs/promises';
import path from 'path';

const [name] = process.argv.slice(2);

const root = path.resolve(process.cwd(), 'question/FrontEnd');

(async function () {
  const templateDir = root + '/template/';
  const createDir = root + '/' + name + '/';
  const files = await fs.readdir(templateDir);
  await fs.mkdir(createDir);
  for (const file of files) {
    await fs.copyFile(templateDir + file, createDir + file);
  }
})();
