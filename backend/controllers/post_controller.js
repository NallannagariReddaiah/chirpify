import Notification from '../models/notification_model.js';
import User from '../models/user_model.js';
import Post from '../models/postModel.js';

import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req, res) =>{
    try{
        const {text} = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(!text &&!img){
            return res.status(400).json({error: "Post must have text (or) image"});
        }

        if(img){
            const uploadResponse = await cloudinary.uploader(img);  
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user:userId,
            text,
            img,
        })

        await newPost.save();

        return res.status(200).json({success:"Post is successfully posted"});
    }
    catch(error){
        console.log(`Error took plaae at post creation-${error}`);
        return res.status(500).json({error:"Internal server error"});
    }
}

export const deletePost = async (req, res) => {

try{

    const post = await Post.findById(req.params.id);

    if(!post) {
        return res.status(404).json({error:"Post not found"});
    }

    if(post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({error:"You are not authorized to delete this post"});
    }

    if(post.img){
        const imgId = post.img.split("/").split(".")[0];
        await cloudinary.destroy(imgId);
        // In order to save the space usage
    }

    await Post.findByIdAndDelete({_id:req.params.id});
    
    res.status(200).json({message:"Post deleted successfully"});

}catch(error){
    console.log("Error in dataPost controller:", error);
    res.status(500).json({error:" Internal server error"});
}

}

export const commentPost = async (req,res)=>{
    try{
        const {text} =  req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({message:"Text field is required"});
        }

        const post = await Post.findById(postId);
        
        if(!post){

            return  res.status(400).json({message:"Post not found"});
        }

        const comment = {user:userId,text:text};

        post.comments.push(comment);

        post.save();
        res.status(200).json(post);
    }catch(error){
        console.log(`Error in commentOnPost controller: `,error);
        res.status(500).json({error:"Internal server error"});
    }
}

export const likeUnlikePost = async (req, res) => {

    try{
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).json({error:"Post Not Found"});
        }

        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            // Now we are gonna delete  the previuosly given post
            await post.updateOne({_id:postId}, {$pull:{likes:userId}});
            await User.updateOne({_id:userId}, {$pull:{likedPosts:postId}});
            post.save();
            res.status(200).json({success:"Like deleted successfully"});
        }
        else{
            // we are gonna add the like for that post
            post.likes.push(userId);
            await User.updateOne({_id:userId}, {$push:{likedPosts:postId}});
            post.save();

            const notification =new Notification({
                from: userId,
                to: post.user,
                type:"like",
            })
            await notification.save();

            return res.status(200).json({message:"post liked successfully"});
        }
    }
    catch(error){

    }

}
export const getAllPosts = async (req, res) => {

    try{

        const posts = await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password",
        })
        
        if(posts.length === 0){
            return res.status(200).json([])
        }

        res.status(200).json(posts);

    }catch(error){
            console.log(`Error at getAllUsers controller ${error}`)
            res.status(500).json({message:"Internal server error"});
    }

};

export const getLikedPosts = async (req, res) => {

    const userId = req.params.id;

    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        
        const likedPosts = await Post.find({_id:{$in:user.likedPosts}})
        .populate({
            path: "comments.user",
            select:"-password",
        });

        res.status(200).json(likedPosts);
    }catch(error){
        console.log(`Error in the get all liked posts file - ${error.message}`);
        res.status(500).json({error:"Internal error"});
    }
}

export const getFollowedPosts = async (req, res) =>{

    try{
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        const following = user.following;

        const feedPosts = await Post.find({user:{$in:following.posts}})
        .sort({createdAt:-1})
        .populate({
            path:'user',
            select:'-password',
        })
        .populate({
            path:"comments.user",
            select:'-password',
        });
        res.status(200).json(feedPosts);
    }
    catch(err){
      console.log("Error occured at the getFollwedpsost function");
      res.status(500).json({err:`Internal serever error ${err}`});  
    }

}

export const getUserPosts = async (req, res) => {
    try{
        const {username} = req.params;

        const user  = await User.findOne({username});
        if(!user){
            return res.status(404).json({err:"user not found"});
        }
        const posts = await Post.find({user:user._id})
                      .sort({createdAt:-1})
                      .populate({
                        path:'user',
                        select:'-password',
                      });
        res.status(200).json(posts);
    }catch(err){
        console.log("Error occured at getUserPosts function");
        res.status(500).json({err:`Internal serever error ${err}`});
    }
}