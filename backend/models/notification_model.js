import mongoose, { mongo } from "mongoose";
import User from "./user_model.js";

const NotificationSchema = new mongoose.Schema({
   from:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         required:true,
   },
   to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
   },
   type:{
    type:String,
    required:true,
    enum:['follow','like',]
   },
   read:{
    type:Boolean,
    default:false,
   }
},{timestamps:true});

const Notification = mongoose.model('Notification',NotificationSchema);
export default Notification;