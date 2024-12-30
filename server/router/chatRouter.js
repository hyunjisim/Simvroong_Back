import express from 'express'
import * as chatController from '../controller/chatController.js'
import { isAuth } from '../middleware/isProfile.js'

const router = express.Router()

router.get('/', isAuth, chatController.getChatList)

// 1대1 채팅 내역 조회
router.get('/:userId', isAuth, chatController.getChatMessages)

// 읽음 처리
router.post('/:userId/read', isAuth, chatController.markMessagesAsRead)

// 새 메시지 전송
router.post('/:userId', isAuth, chatController.sendMessage)

export default router
