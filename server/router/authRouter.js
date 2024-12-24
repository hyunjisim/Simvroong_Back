import express from 'express'
import * as authController from '../controller/authController.js'
// import { isAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// signup
router.post('/signup', authController.registerUser)

router.post('/sendCode', authController.sendCode)

router.post('/verifyCode', authController.verifyCode)

// login
router.post('/login', authController.login)

// find-id
router.post('/findId', authController.findId)

// find-pw
router.post('/findPw', authController.findPw)

// login-stay
// router.get('/me', isAuth, authController.me)

export default router
