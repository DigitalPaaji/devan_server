import { Schema } from "mongoose";



const requestExpert = new Schema({

    name:{
        type:String,
        required:[true,"Name is requied"],
    },
    email:{

    },
    phone:{},
    gender:{},
    dateOfBirth:{},
    address:{},

},{
    timestamps:true
});



