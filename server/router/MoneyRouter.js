import express from 'express';

import * as MoneyController from '../controller/Moneycontroller.js';
import { isAuth } from '../middleware/isProfile.js'


const router = express.Router();

// 잔액 조회
router.get('/', isAuth, MoneyController.account);

// 충전 요청
router.post('/charge', isAuth, MoneyController.charge);

//  출금 요청
router.post('/withdraw', isAuth, MoneyController.withdraw);

//  수익
router.post('/income', isAuth, MoneyController.income);

//  입금
router.post('/deposit', isAuth, MoneyController.deposit);

export default router;
