"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authentication_controller_1 = __importDefault(require("../api/controllers/authentication.controller"));
const router = express_1.default.Router();
router.post("/authentication", authentication_controller_1.default.authentication);
module.exports = router;
