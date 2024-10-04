import User from '../models/user_model.js'; 
import bcrypt from 'bcrypt';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
export const signup = async (req, res) => {
  try {
      const { fullname, username, email, password } = req.body;

      // Check for password length
      if (password.length < 6) {
          return res.status(400).json({ error: 'Password should be of minimum length of 6' });
      }

      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if the email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
          fullname,
          username,
          email,
          password: hashPassword,
      });

      // Save user and return response
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);

      return res.status(201).json({
          _id: newUser._id,
          fullname: newUser.fullname,
          username: newUser.username,
          email: newUser.email,
          followers: newUser.followers,
          following: newUser.following,
          profileImg: newUser.profileImg,
          coverImg: newUser.coverImg,
      });
  } catch (err) {
      console.error(`The error has occurred - ${err}`);
      return res.status(500).json({ error: "Server error" });
  }
};


    //creating the secured password
    //hash password 
    //This can be sone using the bcrypt.js package availbale 
    
export const login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if username and password are provided
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
  
      // Find the user by username
      const user = await User.findOne({ username });
  
      // Check if user exists
      if (!user) {
        return res.status(400).json({ error: "Invalid user details" });
      }
  
      // Debugging log to ensure we have the correct user data
    //   console.log("User found: ", user);
  
      // Check if user.password is defined
      if (!user.password) {
        console.error("Error: User password is not defined.");
        return res.status(400).json({ error: "Invalid user details" });
      }
  
      // Compare the password with the hashed password in the database
      const isPasswordCorrect = await bcrypt.compare(password, user?.password||"");
  
      // Debugging log to check if the password comparison is working
    //   console.log("Password comparison result: ", isPasswordCorrect);
  
      // If password is incorrect, return error
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Invalid user details" });
      }
  
      // Generate token and set cookie
      generateTokenAndSetCookie(user._id, res);
  
      // Send response with user details
      res.status(200).json({
        _id: user._id,
        userName: user.username,
        fullName: user.fullname,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
  
    } catch (err) {
      console.log(`Error in login controller`, err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
export const logout = async (req, res) => {
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    }
    catch(err){
        res.status(500).json({error:"Internal server error"});
    }
}

export const getMe  = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        return res.status(200).json(user);
    }
    catch(err){
        return res.status(500).json({error:"Internal server error"});
    }
}