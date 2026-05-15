"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const app_js_1 = require("./app.js");
(0, dotenv_1.config)();
const PORT = Number(process.env.PORT ?? 3000);
const app = (0, app_js_1.createApp)();
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`backend listening on port ${PORT}`);
});
