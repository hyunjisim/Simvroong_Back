import express from 'express';
import { isAuth } from '../middleware/isProfile.js'; // 확장자 추가
import * as matchController from '../controller/matchController.js'

const router = express.Router();

// 심부름 수락
router.post('/agree/:taskId', isAuth, matchController.handleAcceptOrder);

// 심부름 취소
router.post('/cancel/:taskId', isAuth, matchController.handleCancelOrder);

// 심부름 완료
router.post('/complete/:taskId', isAuth, matchController.handleCompleteOrder);

export default router;