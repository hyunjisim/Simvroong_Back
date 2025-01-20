import express from 'express';
import * as orderController from '../controller/orderController.js';
import * as oneOrderController from '../controller/oneOrderController.js'
import { isAuth } from '../middleware/isProfile.js'


const router = express.Router();

// 심부름 만들기
router.post('/create', isAuth, orderController.createOrder);

// 상세 페이지 가져오기
router.get('/:taskId', isAuth, oneOrderController.getOrderById);

// 찜 상태 패치
router.post('/:taskId', isAuth, oneOrderController.getLikeStatus);

// 상세 페이지에서 찜기능과 Q&A
router.patch('/:taskId', isAuth, oneOrderController.manageController);


export default router;
