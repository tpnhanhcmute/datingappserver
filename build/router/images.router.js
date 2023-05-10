"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const images_controller_1 = __importDefault(require("../api/controllers/images.controller"));
const router = express_1.default.Router();
router.post("/upload", images_controller_1.default.uploadImage);
router.post("/getImages", images_controller_1.default.getImages);
module.exports = router;
