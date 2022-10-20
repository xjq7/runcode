## runcode

在线代码运行

语言支持度

- C++ 11

- nodejs lts

- golang latest

- python3

- bash

## 开发

### server

koa + typescript + dockerode

1. 构建镜像

未构建的镜像在运行代码时会报错

- 构建 C++镜像

  ```bash
  cd server/src/docker/cpp
  docker build -t cpp:11 .
  ```

- 构建 python3 镜像

  ```bash
    cd server/src/docker/python3
    docker build -t python:3 .
  ```

- 构建 go 镜像

  ```bash
    cd server/src/docker/go
    docker build -t go:latest .
  ```

- 构建 nodejs 镜像

  ```bash
    cd server/src/docker/nodejs
    docker build -t nodejs:lts .
  ```

- 构建 centos 镜像

  ```bash
    cd server/src/docker/centos
    docker build -t centos:7 .
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

vite + react + typescript + tailwindcss + daisyui + mobx + monaco-editor

1. 安装依赖

   ```sh
   cd client
   pnpm i
   ```

2. 启动

   ```sh
   # 起开发环境,需要起 server
   pnpm dev
   # 起生产环境
   pnpm prod
   ```
