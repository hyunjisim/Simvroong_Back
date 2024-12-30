import express from 'express'
import * as profileController from '../controller/profileController.js'
import { isAuth } from '../middleware/isProfile.js'

const router = express.Router()

// router.get('/viewUser/:id')

// view-my-userInfo
router.get('/getNickname', isAuth, profileController.getUserData)
router.post('/userInfo', isAuth, profileController.userInfo)
router.put('/userInfo/modifyInfo', isAuth, profileController.modifyUserInfo)
router.put('/updatePassword', isAuth, profileController.updatePassword)
router.put('/upload', isAuth, profileController.updateImg)

// router.put('/:token', isAuth, profileController.updateUserInfo)

export default router