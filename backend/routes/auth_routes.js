import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
const router=express.Router();
import {signup,login,logout,getMe} from '../controllers/auth_controller.js';
router.get('/me',protectRoute,getMe);
router.post('/signup',signup);
router.post('/login',login)
router.get('/logout',logout)
export default router;