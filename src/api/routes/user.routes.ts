import { Application, Response } from 'express';
import userController from '../controllers/user.controller';

const userRoutes =  (app: Application): void => {
    app.post('/users', userController.create);

    app.post('/user/register',userController.register)

    app.post('/user/discorver',userController.getDiscorverUser)
  };
  export default userRoutes;