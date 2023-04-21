import { user } from "../model/user.model"

export class match{
    // id:String 
    user:user
    urlimage:String

    constructor(){
        // this.id  = new String()
        this.urlimage = new String()
        this.user = new user()
    }
}