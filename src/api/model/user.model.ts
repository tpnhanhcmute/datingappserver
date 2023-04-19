export class user {
    phoneNumber: String
    email: String
    password: String
    fullName: String
    career:String
    dateOfBirth: Date
    age:Number
    hobby:Array<String>
    gender:String
    isAuth:Boolean 
    isFirstLogin:Boolean 
    occupation:String|null 
    constructor(){
      this.phoneNumber = new String()
      this.email = new String()
      this.password = new String()
      this.fullName = new String()
      this.career = new String()
      this.dateOfBirth = new Date()
      this.age = new Number()
      this.hobby = new Array<String>()
      this.gender = new String()
      this.isAuth = false
      this.isFirstLogin = false,
      this.occupation = new String()
    }
  }
