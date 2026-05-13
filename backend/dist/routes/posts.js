"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
exports.postsRouter = (0, express_1.Router)();
// 今はひな型のため、未実装を 501 で返す（フロントのAPIプレースホルダと整合させる）
exports.postsRouter.get('/api/posts', (_req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
exports.postsRouter.post('/api/posts', (_req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
exports.postsRouter.put('/api/posts/:id', (_req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
exports.postsRouter.delete('/api/posts/:id', (_req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
