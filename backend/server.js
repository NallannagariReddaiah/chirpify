import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth_routes.js';
import connectMongoDB from './db/connectMongoDB.js';

dotenv.config();

const app = express();

app.use(express.json()); //for parse the req.body
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

console.log(process.env.MONGO_URI);

const port=process.env.PORT;

app.use('/api/auth',authRoutes);

app.listen(port,()=>{
    console.log(`Server is runnig in the port having the port number: ${port}`);
    connectMongoDB();
})