## runcode

代码在线编辑器

语言支持度

- C++ 11

- Java

- rust latest

- nodejs lts

- golang latest

- python3

- php

- bash

## 开发

前置条件

nodejs > 14.17.0

包管理工具 pnpm 安装

```sh
npm install pnpm -g
```

### server

koa + typescript + dockerode

1. 构建镜像

前置条件, 安装了 docker

未构建的镜像, 在编辑器里 run 代码时会报镜像 404, 所以开发过程中无需全部构建, 构建需要的语言环境即可

- 构建 C++ 镜像

  ```bash
  cd server/src/docker/cpp
  docker build -t cpp:11 .
  ```

- 构建 rust 镜像

  ```bash
  cd server/src/docker/rust
  docker build -t rust:latest .
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

- 构建 java 镜像

  ```bash
    cd server/src/docker/java
    docker build -t java:latest .
  ```

- 构建 php 镜像

  ```bash
    cd server/src/docker/php
    docker build -t php:8 .
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
