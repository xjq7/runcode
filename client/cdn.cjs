const dayjs = require('dayjs');
const deploy = require('aliyun-oss-static-deploy');
const path = require('path');

const [AccessKeyId, AccessKeySecret, bucket, region] = process.argv.slice(2);

(async function () {
  const ossConfig = {
    accessKeyId: AccessKeyId,
    accessKeySecret: AccessKeySecret,
    timeout: 60 * 3 * 1000,
    bucket,
    region,
  };
  try {
    await deploy({
      ossConfig,
      //  最好同时配置staticPath,ossPath,确定上传文件路径以及存储路径
      staticPath: path.resolve(__dirname, 'dist/assets'), // 默认为根路径
      ossPath: 'runcode/' + dayjs().format('YYYY-MM-DD') + '/assets', // oss存储路径,默认是根路径,
      recursion: true, // 递归上传,默认为true,文件夹下所有文件递归上传
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
