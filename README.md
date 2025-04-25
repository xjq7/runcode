## runcode

希望 Runcode 可以帮助到你

在线代码运行编辑器

语言支持度

- C++ 11

- C

- Java

- Rust lts

- Nodejs lts

- Go lts

- C# lts

- Python3

- php

代码格式化支持

- C++

- C

- Java

- Nodejs

## 开发

前置条件

nodejs >= 16

包管理工具 pnpm 安装

```sh
npm install pnpm@8 -g
```

### server

- koa + typescript + dockerode

1. 构建镜像

前置条件, 安装了 docker, docker 需要设置端口 为 2375

**防火墙跟服务器安全组不要开放 2375 端口, 以免造成严重的安全问题, 详情参考 [issues/24](https://github.com/xjq7/runcode/issues/24)**,

在 centos 7 端口修改方法:
在配置文件里 ExecStart=/usr/bin/dockerd 这串后面加上 -H tcp://0.0.0.0:2375 , 然后重启 docker
我的配置文件在 /usr/lib/systemd/system/docker.service 这个路径
配置文件示例

![Alt text](images/image.png)

未构建的镜像, 在编辑器里 run 代码时会报镜像 404, 所以开发过程中无需全部构建, 构建需要的语言环境即可

- 构建 C++ 镜像

  ```bash
    cd server/src/docker/cpp/11.5
    docker build -t cpp:11.5 .

    cd server/src/docker/cpp/14.2
    docker build -t cpp:14.2 .
  ```

- 构建 rust 镜像

  ```bash
    cd server/src/docker/rust/1.83.0
    docker build -t rust:1.83.0 .
  ```

- 构建 python 镜像

  ```bash
    cd server/src/docker/python/3.9.18
    docker build -t python:3.9.18 .

    cd server/src/docker/python/2.7.18
    docker build -t python:2.7.18 .
  ```

- 构建 go 镜像

  ```bash
    cd server/src/docker/go/1.23
    docker build -t go:1.23 .

    cd server/src/docker/go/1.20
    docker build -t go:1.20 .

    cd server/src/docker/go/1.18
    docker build -t go:1.18 .
  ```

- 构建 nodejs 镜像

  ```bash
    cd server/src/docker/nodejs/22
    docker build -t nodejs:22 .

    cd server/src/docker/nodejs/20
    docker build -t nodejs:20 .

    cd server/src/docker/nodejs/18
    docker build -t nodejs:18 .

    cd server/src/docker/nodejs/16
    docker build -t nodejs:16 .
  ```

- 构建 java 镜像

  ```bash
    cd server/src/docker/java/20
    docker build -t java:20 .

    cd server/src/docker/java/17
    docker build -t java:17 .

    cd server/src/docker/java/11
    docker build -t java:11 .

    cd server/src/docker/java/8
    docker build -t java:8 .
  ```

- 构建 C# 镜像

  ```bash
    cd server/src/docker/dotnet/6.12
    docker build -t dotnet:6.12 .
  ```

- 构建 php 镜像

  ```bash
    cd server/src/docker/php/8.4
    docker build -t php:8.4 .

    cd server/src/docker/php/7.4
    docker build -t php:7.4 .
  ```

2. 配置调整

本地开发时根据系统调整 docker 连接配置

```js
// server/src/config/docker.ts 此文件为 docker 连接配置

// 通过端口号连接, Windows 或 Linux 下可以使用这种
const config: DockerOptions = {
  // 通过端口连接方式
  host: '127.0.0.1',
  port: '2375',
  protocol: 'http',
  // 通过 socket 连接方式
  // socketPath: '/var/run/docker.sock',
};

// 通过 socket 连接, Mac 或者 Linux 下可以使用这这种
const config: DockerOptions = {
  // 通过端口连接方式
  // host: '127.0.0.1',
  // port: '2375',
  // protocol: 'http',
  // 通过 socket 连接方式
  socketPath: '/var/run/docker.sock',
};
```

2. 安装依赖

   ```sh
   cd server
   pnpm i
   ```

3. 启动

   ```sh
   pnpm dev
   ```

### client

- vite + react + typescript + antd

- UI

  tailwindcss, 原子化 css, 在个人项目里使用优势很大, 节省时间、代码

  且都支持按需引入, 体积更小

- 状态管理

  mobx、mobx-react-lite、mobx-persist-store

- 编辑器使用 monaco-editor

  高亮、输入提示、部分语言代码格式化、多主题

  引入 clang-format wasm 模块实现 C/C++/Java 语言的代码格式化

1. 安装依赖

   ```sh
   cd client
   pnpm i
   ```

2. 编译 tailwindcss

   ```sh
   # 启动后另开终端启动服务
   pnpm build:tailwind:watch
   ```

3. 启动服务

   ```sh
   # 起开发环境,需要起 server
   pnpm dev
   # 起生产环境
   pnpm prod
   ```

## 部署

---

### server

1. 服务端环境

- nodejs
- pm2
- docker
- pnpm

2. 编译

进入 server 目录

```sh
cd server
pnpm i
pnpm build
```

3. [需要构建好 docker 镜像](#server)

4. 启动服务

启动后服务端口号 为 39005

```sh
pnpm run deploy
```

### client

进入 client 目录

1. 安装依赖

```sh
pnpm i
```

2. 构建

```sh
pnpm build
```

3. 使用 nginx 代理静态资源, 构建好的静态资源在 dist 目录下

主要是 html 文件, 其他静态资源部署到我的 cdn 上了

## commit 规范

- feat：新功能（feature）
- fix：修补 bug
- docs：文档（documentation），只改动了文档部分
- style： 格式（不影响代码运行的变动），例如去掉空格、改变缩进
- refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
- test：添加测试或者修改现有测试
- chore：构建过程或辅助工具的变动
- perf：提高性能的改动
- ci：自动化流程配置修改、与 CI（持续集成服务）有关的改动
- revert：回滚到上一个版本，执行 git revert 打印的 message

## 赞助

如果觉得 Runcode 对你有帮助, 可以赞助一下

![微信赞助码](https://xjq-img.oss-cn-shenzhen.aliyuncs.com/WechatIMG59.jpg)
