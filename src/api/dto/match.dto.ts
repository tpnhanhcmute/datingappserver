import { User } from "../model/user.model"
import { DiscorverUser } from "./discoverUser.dto"
import { matchUser } from "./matchUser.dto"

export interface Match{
    // id:String 
    user:matchUser
    urlimage:String
}