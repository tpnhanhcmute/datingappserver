"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../api/controllers/user.controller"));
const router = express_1.default.Router();
<<<<<<< HEAD
router.get("getUsers", user_controller_1.default.getUser);
=======
>>>>>>> origin/main
router.post("/update", user_controller_1.default.update);
router.post("/like", user_controller_1.default.like);
router.post("/chat", user_controller_1.default.chat);
router.post("/register", user_controller_1.default.register);
router.post("/discorver", user_controller_1.default.getDiscorverUser);
router.post("/login", user_controller_1.default.login);
router.post("/getmatch", user_controller_1.default.getmatch);
module.exports = router;
