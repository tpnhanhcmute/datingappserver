import {message} from "./content.model"
export class conversation{
    messageID:String
    listContent: Array<message>
    constructor(){
        this.messageID = new String()
        this.listContent = new Array<message>()
    }
}