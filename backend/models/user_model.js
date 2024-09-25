import mongoose from 'mongoose';

const userSchema =new mongoose.Schema({
    //Timestamps is used to note the time of the user when he is logged in
    //creates the account it self
    //member since july 2021 createdAt
    username:{
        type:String,
        required:true,
        unique:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minLength:6,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId, //Reference to the user model
            //16 characters
            ref:"User",//reference to the user model
            default:[]
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId, //Reference to the user model
            //16 characters
            ref:"User",//reference to the user model
            default:[]
        }
    ],
    profileImage:{
        type:String,
        default:"",
    },
    coverImg:{
        type:String,
        default:"",
    },
    Bio:{
        type:String,
        default:"",
    },
    link:{
        type:String,
        default:"",
    },
    likedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Post',
            default:[],
        }
    ]
},{timestamps:true})

const User=mongoose.model("User",userSchema);
//Name of teh collection in the mongoose is going to be users collection
export default User;