import User from '../models/user_model.js'; 
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try{
        const token =req.cookies?.jwt;
        if(!token){
            return res.status(401).json({error:"unauthorized:No token provided"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error:"unauthorized:Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
           return res.status(404).json({error: "User not found"}); 
        }
        req.user=user;
        next();
    }
    catch(error){
        console.log(`Error in protectRoute middleware`,error.message);
        return res.status(500).json({error:"Internal Server Error"});
    }
}
//it is a middleware function used over here
//inorder to perform secured authorization