import { Request, Response } from 'express';

import {admin, database , realtimedb} from '../services/firebase.service'
import {user } from '../model/user.model';
import { hashMessage, randomNumber } from '../../utils/utils';


const create = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
    const { name, age } = req.body;

    const userRef = database.collection('user');
      userRef.add({
        name:name,
        age: age
      }).then((userRef)=>{
        console.log(userRef.id)
        res.status(200).json({userRef})})
        .catch((error)=>{res.status(400).json({error})})
    }

const register = async (req:Request, res:Response):Promise<void> =>{
  const {email, password} = req.body

  const newUser = new user()
  newUser.email = email
  newUser.password = await hashMessage(password)
  const plainUser = Object.assign({}, newUser);

  const userRef = database.collection('user')
  try{

    //Check user
     let querySnapshot = await userRef.where("email","==", email)
     if((await querySnapshot.get()).size !=0){
      querySnapshot = querySnapshot.where("isAuth","==", false)
      if((await querySnapshot.get()).size != 0)
      {
        res.status(200).send({
          isError:true,
          message:"Tài khoản đã tồn tại",
        })
        return
      }else{

        console.log(querySnapshot)
        let id ="";
        (await querySnapshot.get()).forEach((doc)=>{
          
          return
        })
        let otp = randomNumber(4)
        res.status(200).send({
          isError:false,
          message:"send OTP thành công",
          data:{
            id:id,
            otp: otp
          }
        })
        return
      }
     }

      const rss = await userRef.add(plainUser)
      console.log(rss.id)
      let otp = randomNumber(4)
      res.status(200).send({
        isError:false,
        message:"send OTP thành công",
        data:{
          id:rss.id,
          otp: otp
        }
      })
  }catch(error){
    console.log(error)
      res.status(400).send({
        isError:true,
        message:error
      })
  }
}

export default {
  create,register
};