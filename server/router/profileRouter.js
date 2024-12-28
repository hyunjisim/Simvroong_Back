import express from 'express'
import * as profileController from '../controller/profileController.js'
import { isAuth } from '../middleware/isProfile.js'

const router = express.Router()

// router.get('/viewUser/:id')

// view-my-userInfo
router.post('/userInfo', isAuth, profileController.userInfo)
router.put('/userInfo/modifyInfo', isAuth, profileController.modifyUserInfo)
// router.put('/userInfo/updatePhoto', profileController.updatePhoto)
router.put('/updatePassword', isAuth, profileController.updatePassword)

// router.put('/:token', isAuth, profileController.updateUserInfo)

export default router
