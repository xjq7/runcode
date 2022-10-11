"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const app = new koa_1.default();
const router = new koa_router_1.default();
router.get('/', (ctx, next) => {
    // ctx.router available
});
app
    .use(router.routes())
    .use(router.allowedMethods());
app.on('error', err => {
    console.error('server error', err);
});
app.listen(3000);
