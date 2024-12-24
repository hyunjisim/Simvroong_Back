import express from 'express'
import * as profileController from '../controller/profileController.js'
import { isAuth } from '../middleware/isProfile.js'
// import { isAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// router.get('/viewUser/:id')

// view-my-userInfo
router.put('/userInfo', isAuth, profileController.userInfo)
router.put('/userInfo/modifyInfo', isAuth, profileController.modifyUserInfo)
// router.put('/userInfo/updatePhoto', profileController.updatePhoto)
router.put('/userInfo/updateNickname', isAuth, profileController.updateNickname)
router.put('/userInfo/updatePhonenumber', isAuth, profileController.updatePhoneNumber)
router.put('/userInfo/updatePassword', isAuth, profileController.updatePassword)

// router.put('/:token', isAuth, profileController.updateUserInfo)

export default router
