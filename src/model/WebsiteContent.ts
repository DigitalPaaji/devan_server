import { Schema,Document, model } from "mongoose";

interface IWeb extends Document{
page:String;
des:String;
}


const WebsiteSchema = new Schema<IWeb>({
    page:{
        type:String,
        required:true,
        unique:true
    },
    des:{
     type:String,
     required:true,   
    }    
},{
    timestamps:true
})


const Content = model<IWeb>("Content",WebsiteSchema)

export default Content;
