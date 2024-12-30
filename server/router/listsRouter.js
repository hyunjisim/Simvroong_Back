import express from 'express';
import * as listController from '../controller/listController.js';
import { isAuth } from '../middleware/isProfile.js';

const router = express.Router();

// 찜한 리스트 불러오기기
router.get('/', isAuth, listController.getlist);

export default router;