export class discorverUser{
    fullName:String 
    hobby:Array<String>
    age:Number
    distance:Number
    occupation:String
    imageUrl:Array<String>

    constructor(){
        this.fullName = new String()
        this.hobby = new Array<String>()
        this.age = new Number()
        this.distance = new Number()
        this.occupation = new String()
        this.imageUrl= new Array<String>()
    }
}