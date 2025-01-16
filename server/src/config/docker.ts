import { DockerOptions } from 'dockerode';

const config: DockerOptions = {
  // 通过端口连接方式
  host: '127.0.0.1',
  port: '2375',
  protocol: 'http',
  // 通过 socket 连接方式
  // socketPath: '/var/run/docker.sock',
};

export default config;
