import { Application, Response } from 'express';
import userController from '../controllers/user.controller';

const userRoutes =  (app: Application): void => {
    app.post('/users', userController.create);
  };
  export default userRoutes;