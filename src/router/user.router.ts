import express from "express";

import userController from "../api/controllers/user.controller";

const router = express.Router();

router.post("/create", userController.create);

router.patch("/update", userController.update);

router.post("/users", userController.create);

router.post("/user/register", userController.register);

router.post("/user/discorver", userController.getDiscorverUser);

// router.post("/match",controller.match);

export = router;
