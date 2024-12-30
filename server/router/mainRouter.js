import express from 'express';
import * as mainController from '../controller/mainController.js';


const router = express.Router();

// 모든 데이터 또는 카테고리별 데이터 조회
router.get('/', mainController.getAllOrder);

export default router;