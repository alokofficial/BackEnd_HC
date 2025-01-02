import {Router} from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),registerUser
);
router.route('/login').post(loginUser);

//secured routes
router.route('/current-user').get(verifyJWT,getCurrentUser);
router.route('/refresh-token').post(refreshAccessToken);

router.route('/logout').post(verifyJWT,logoutUser);

// secure and upadte routes
router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar);

router.route('/cover-image').patch(verifyJWT,upload.single('coverImage'),updateCoverImage);
router.route('/update-acount').patch(verifyJWT,updateAccountDetails);
router.route('/change-password').post(verifyJWT,changeCurrentPassword);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router