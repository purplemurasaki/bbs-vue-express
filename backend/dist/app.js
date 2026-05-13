"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./routes/index.js");
function createApp() {
    const app = (0, express_1.default)();
    // JSON受信（投稿作成はmultipartのため、routes側で扱う予定）
    app.use(express_1.default.json());
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
        app.use((0, cors_1.default)({
            origin: corsOrigin,
        }));
    }
    app.use(index_js_1.healthRouter);
    app.use(index_js_1.postsRouter);
    return app;
}
