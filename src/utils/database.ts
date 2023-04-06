import { Sequelize } from 'sequelize-typescript';

import dotenv from 'dotenv';
import type { DotenvConfigOutput } from 'dotenv';
dotenv.config();
const env: DotenvConfigOutput['parsed'] = process.env;

const sequelize = new Sequelize(
    env.DB_NAME as string,
    env.DB_USER as string,
    env.DB_PASSWORLD as string,
    {
        host: 'localhost',
        dialect: 'mysql',
        define: {
            timestamps: false,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
    }
);

export default sequelize;

