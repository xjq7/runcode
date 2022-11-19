import fs from 'fs/promises';
import path from 'path';
import Axios from 'axios';
import dayjs from 'dayjs';
import crypto from 'crypto';

const args = process.argv.slice(2);

const isProd = !!args.find((arg) => arg === 'prod');

let qsToken = args.find((arg) => /qstoken=/.test(arg));
qsToken = qsToken.replace(/qstoken=/, '');

const cacheFile = isProd ? 'cache.prod.json' : 'cache.json';

const instance = Axios.create({
  baseURL: isProd ? 'https://rapi.xjq.icu' : 'http://127.0.0.1:39005',
  headers: {
    'Content-Type': 'application/json',
    'Qs-Token': qsToken,
  },
});

async function createQuestion(data) {
  await instance.post('/question', data);
}

async function updateQuestion(data) {
  await instance.put('/question', data);
}

function getHash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

const root = path.resolve(process.cwd(), 'question/FrontEnd');
(async function () {
  const dirs = (await fs.readdir(path.resolve(root))) || [];

  let cache = {};

  try {
    const cacheJson =
      (await fs.readFile(path.resolve(root, cacheFile), 'utf8')) || '';
    cache = JSON.parse(cacheJson);
  } catch (error) {}

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

        const date = dayjs().add(8, 'h').toISOString();
        data['createdAt'] = date;
        data['type'] = 1;
        data['level'] = 1;
        data['name'] = dir;
      }
      const nowHash = getHash(contents);
      const cacheHash = cache[dir];

      if (cacheHash === undefined) {
        try {
          await createQuestion(data);
          cache[dir] = nowHash;
          console.log(dir + '创建成功!');
        } catch (error) {
          console.log(error);
        }
      } else if (nowHash !== cacheHash) {
        try {
          await updateQuestion(data);
          cache[dir] = nowHash;
          console.log(dir + '更新成功!');
        } catch (error) {
          console.log(error.message);
        }
      } else {
        console.log(dir + '命中缓存,跳过更新');
      }
    }
  }

  const cachePath = path.resolve(root, cacheFile);
  await fs.writeFile(cachePath, JSON.stringify(cache));
})();
