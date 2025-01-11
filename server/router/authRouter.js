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

// 디코딩 된 objId로 유저 데이터 가져오기
// router.post('/getUserBy_Id', authController.me)

export default router