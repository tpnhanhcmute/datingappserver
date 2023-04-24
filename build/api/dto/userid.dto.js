"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userid = void 0;
const user_model_1 = require("../model/user.model");
class userid {
    constructor() {
        this.id = new String();
        this.user = new user_model_1.user();
    }
}
exports.userid = userid;
