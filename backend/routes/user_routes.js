import express from 'express';

import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile } from '../controllers/user_controller.js';
import { followUnfollowUser,getSuggestedUsers,updateUser} from '../controllers/user_controller.js';

const router = express.Router();

router.post('/follow/:id',protectRoute,followUnfollowUser);
router.get('/profile/:username',protectRoute,getUserProfile);
router.get('/suggested',protectRoute,getSuggestedUsers);
router.post('/update',protectRoute,updateUser);

export default router;