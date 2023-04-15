import {message} from "./content.model"
export interface conversation{
    messageID:String,
    listContent: Array<message>
}