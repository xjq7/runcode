import fs from 'fs/promises';
import path from 'path';

const [name] = process.argv.slice(2);

const root = path.resolve(process.cwd(), 'question/FrontEnd');

(async function () {
  const templateDir = root + '/template/';
  const createDir = root + '/' + name + '/';
  const files = await fs.readdir(templateDir);
  try {
    await fs.mkdir(createDir);
  } catch (error) {
    const message = error.message || '';
    if (/EEXIST/.test(message)) {
      console.log('题目已存在, 请重命名');
    } else {
      console.log(message);
    }
    return;
  }

  for (const file of files) {
    let content = await fs.readFile(templateDir + file, 'utf-8');
    content = content.replace(/template/g, name);
    await fs.writeFile(createDir + file, content, { encoding: 'utf-8' });
  }

  console.log(`${name} 创建成功`);
})();
