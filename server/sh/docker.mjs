#!/usr/bin/env zx
const path = require('path');

const root = path.resolve('.');

const dockerPath = 'src/docker';

const nodejs = path.join(root, dockerPath, 'nodejs');

cd(nodejs);
await $`docker build -t nodejs:lts .`;

cd(root);
await $`docker build -t cpp:11 .`;

// await $`docker build -t go:latest ../src/docker/go`;
