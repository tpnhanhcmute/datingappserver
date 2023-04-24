"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const location_controler_1 = __importDefault(require("../api/controllers/location.controler"));
const router = express_1.default.Router();
router.post("/update", location_controler_1.default.update);
module.exports = router;
