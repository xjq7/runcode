## runcode

在线代码运行

语言支持度

- C++ 11

- nodejs lts

- golang latest

## 开发

### server

1. 构建镜像

比如构建 C++镜像

```bash
cd server/src/docker/cpp
docker build -t cpp:11 .
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

1. 安装依赖

```sh
cd client
pnpm i
```

2. 启动

```sh
pnpm dev
```
