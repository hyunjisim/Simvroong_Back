import express from 'express'
import * as chatController from '../controller/chatController.js'
import { isAuth } from '../middleware/isProfile.js'
import * as chatListController from '../controller/chatListController.js'
import * as useListController from '../controller/useListController.js'

const router = express.Router()

router.post('/:channel', isAuth, chatController.creatChat)

router.get('/:channel', isAuth, chatController.getChatData)

//채팅 리스트 조회
router.get('/', isAuth, chatListController.getChatRoomList)

// 1대1 채팅 내역 조회
// 메세지 보낸거 저장
router.post('/:channel/message/send', isAuth, chatController.sendMessage)

// 메세지 데이터 로드
router.get('/:channel/message', isAuth, chatController.getChatMessages)

// 읽음 처리
router.post('/:userId/read', isAuth, chatController.markMessagesAsRead)


// 심부름 거래 완료
router.post('/:channel/completed', isAuth, useListController.UpdateActive)

// 새 메시지 전송
// router.post('/:userId', isAuth, chatController.sendMessage)

// test
// 사용자 간 메시지 조회 API
// router.get('/:fromUserId/:toUserId', getMessages);

export default router
