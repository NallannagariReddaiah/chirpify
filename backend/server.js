import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';

import authRoutes from './routes/auth_routes.js';
import userRoutes from './routes/user_routes.js';
import postRoutes from './routes/post_routes.js'
import notificationRoutes from './routes/notification_routes.js'

import connectMongoDB from './db/connectMongoDB.js';

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json()); //for parse the req.body
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

console.log(process.env.MONGO_URI);

const port=process.env.PORT;

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts/',postRoutes);
app.use('/api/notifications',notificationRoutes);

app.listen(port,()=>{
    console.log(`Server is runnig in the port having the port number: ${port}`);
    connectMongoDB();
})