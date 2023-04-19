export class interaction{
    userIDLike:String
    userIDLiked: String
    isLike :boolean
    messageID:String|null
    constructor(){
        this.userIDLike = new String()
        this.userIDLiked = new String()
        this.isLike = false,
        this.messageID = null
    }
}