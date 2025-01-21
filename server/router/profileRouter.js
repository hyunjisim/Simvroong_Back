import express from 'express'
import * as profileController from '../controller/profileController.js'
import { isAuth } from '../middleware/isProfile.js'
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { aws_s3_upload } from "../middleware/upload.js";
import multer from 'multer'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'png'],
    },
});

const upload = multer({ storage: storage });

const router = express.Router()

// router.get('/viewUser/:id')

// view-my-userInfo
router.get('/getNickname', isAuth, profileController.getUserData)
router.post('/userInfo', isAuth, profileController.userInfo)
router.put('/userInfo/modifyInfo', isAuth, profileController.modifyUserInfo)
router.put('/updatePassword', isAuth, profileController.updatePassword)
router.put("/upload", isAuth, aws_s3_upload, profileController.updateImg)
router.get('/', isAuth, (req, res) => {
    // console.log('profile 라우터 호출됨'); // 추가 로그
    profileController.getUserData(req, res);
});

// router.put('/:token', isAuth, profileController.updateUserInfo)

export default router