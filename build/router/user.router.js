"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../api/controllers/user.controller"));
const router = express_1.default.Router();
router.post("/create", user_controller_1.default.create);
router.post("/update", user_controller_1.default.update);
router.post("/like", user_controller_1.default.like);
router.post("/chat", user_controller_1.default.sendMessage);
router.post("/register", user_controller_1.default.register);
router.post("/discorver", user_controller_1.default.getDiscorverUser);
router.post("/login", user_controller_1.default.login);
module.exports = router;
