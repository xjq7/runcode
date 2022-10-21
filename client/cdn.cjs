/* eslint-disable no-undef */

const Axios = require('axios');
const dayjs = require('dayjs');
const deploy = require('aliyun-oss-static-deploy');
const path = require('path');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const instance = Axios.create({
  baseURL: 'https://b.xjq.icu',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

function getUploadToken() {
  return instance.get('/oss/sts-token').then(({ data: responseData }) => {
    const { code, data } = responseData;
    if (code === 0) {
      return data;
    } else {
      process.exit(1);
    }
  });
}

(function () {
  getUploadToken().then((ossConfig) => {
    const { AccessKeyId, AccessKeySecret, SecurityToken } = ossConfig || {};
    ossConfig = Object.assign({}, ossConfig, {
      stsToken: SecurityToken,
      accessKeyId: AccessKeyId,
      accessKeySecret: AccessKeySecret,
      timeout: 60 * 3 * 1000,
    });
    deploy({
      ossConfig,
      //  最好同时配置staticPath,ossPath,确定上传文件路径以及存储路径
      staticPath: path.resolve(__dirname, 'dist'), // 默认为根路径
      ossPath: 'runcode/' + dayjs().format('YYYY-MM-DD'), // oss存储路径,默认是根路径,
      recursion: true, // 递归上传,默认为true,文件夹下所有文件递归上传
    });
  });
})();
