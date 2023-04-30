import { User } from "../model/user.model"
import { matchUser } from "./matchUser.dto"

export interface UserIDM{
    id:String 
    user:matchUser
}