import express from 'express';
import * as listController from '../controller/likeListController.js';
import { isAuth } from '../middleware/isProfile.js';

const router = express.Router();

// 찜한 리스트 불러오기
router.get('/', isAuth, listController.getlist);

// 하트 취소
router.patch('/:taskId', isAuth, listController.deletelike);

export default router;