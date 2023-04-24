"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
class user {
    constructor() {
        this.phoneNumber = new String();
        this.email = new String();
        this.password = new String();
        this.fullName = new String();
        this.career = new String();
        this.dateOfBirth = new Date();
        this.age = new Number();
        this.hobby = new Array();
        this.gender = new String();
        this.isAuth = false;
        this.isFirstLogin = false,
            this.occupation = new String();
    }
}
exports.user = user;
