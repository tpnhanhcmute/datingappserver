import { Request, Response } from 'express';

import {admin, db} from '../services/firebase.service'

const create = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
    const { name, age } = req.body;

    const db= admin.database()
    // Writing data to the database
    db.ref('users/1').set({
      name: name,
      age: age
    });

    // Reading data from the database
    db.ref('users/1').once('value')
      .then((snapshot) => {
        console.log(snapshot.val());
        res.sendStatus(200).json(snapshot.val)
      })
      .catch((error) => {
        console.log('Error retrieving data:', error.message);
        res.sendStatus(400).json(error.message)
      });
    }

export default {
  create,
};