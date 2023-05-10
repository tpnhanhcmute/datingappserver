export interface User {

    phoneNumber: string
    email: string
    password: string
    fullName: string
    career:string
    dateOfBirth: string
    age:Number
    hobby:Array<string>
    gender:string
    isAuth:Boolean 
    isFirstLogin:Boolean 
    occupation:string|null
    deviceToken: string
  }
