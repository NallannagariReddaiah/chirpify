import User from "../models/user_model.js";

import {v2 as cloudinary} from 'cloudinary';

import Notification from "../models/notification_model.js"
import bcrypt from 'bcrypt';

export const getUserProfile = async (req,res)=>{
    const {username} =req.params;

    try{
        const user = await User.findOne({username:username}).select('-password');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    }
    catch(err){
        console.log(`Some error has occured in getUserProfile`);
        return res.status(500).json({error:`Error has occured at getUserProfile ${err}`});
    }
}

export const followUnfollowUser = async (req,res)=>{
    try{
        const {id} = req.params;
        const userToModify = await User.findOne({_id:id});
        const currentUser = await User.findOne(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({error:"You can't follow or unfollow yourself"});
        }
        if(!userToModify || !currentUser){
            return res.status(400).json({error:"User not found"});
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            // Unfollow  the user as following earlier
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});

            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id,
            });

            await Notification.save();

            //

            return res.status(200).json({success:"Successfully unflollowed"});
        }   
        else{
            //Follwing the user as following earlier
            await User.findByIdAndUpdate(id,{$push:{followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
            return res.status(200).json({success:"Successfully followed"})
        }
    }
    catch(err){
        console.log(`Some error has occured in followAndUnfollow`);
        return res.status(500).json({error:`Error has occured at getUserProfile ${err}`});
    }
}

export const getSuggestedUsers = async (req, res) => {
    try{
        const userId = req.user._id;
        const userFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([{
            $match:{
                _id:{$ne:userId},
            }
          },
          {$sample:{size:10}}
        ])
        const filteredUsers = await users.filter(user=>!userFollowedByMe.following.includes(user._id));
        const suggestedUsers = await filteredUsers.slice(0,4);
        suggestedUsers.forEach(user=>user.password=null)
        res.status(200).json(suggestedUsers);
    }
    catch(err){
        console.log(`Error at getSuggested passwords: `,err.message);
        res.status(500).json({err:err.message});
    }
}
export const updateUser = async (req, res) => {
    const {fullname,email,username,currentPassword,newPassword,Bio,link} = req.body;
    let {profileImg,coverImg} = req.body;

    const userId = req.user._id;

    try{
        let user = await  User.findOne({_id: userId});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        // if(!newPassword || !currentPassword){
        //     return res.status(400).json({message:"Provide the both the current and new passwords"});
        // }
        if(currentPassword&&newPassword){
            const isMatch = await bcrypt.compare(currentPassword,newPassword);
            if(!isMatch){
                return res.status(400).json({error:"Current password is  not matched"});
            }
            if(newPassword.length < 6){
                return res.status(400).json({error:"The password must be longer than 6 characters"});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }
        if(profileImg){
            
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage.split('/').pop().split('.')[0]);
            }
            const uploadResponse = await cloudinary.uploader(profileImg);
            profileImg =  await uploadResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }
            const uploadResponse = await cloudinary.uploader(coverImg);
            coverImg = await uploadResponse.secure_url;
        }

        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.email =  email || user.email
        user.Bio = Bio || user.Bio;
        user.link = link || user.link;
        user.profileImage = profileImg || user.profileImage;
        user.coverImg = coverImg || user.coverImg;

        await user.save();

        user.password = null;
         return res.status(200).json(user)
    }
    catch(err){
        console.log(`Error ocuured at update user ${err.message}`);
        return res.status(400).json(err);
    }
}