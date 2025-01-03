import express from 'express'
import * as useListController from '../controller/useListController.js'
import { isAuth } from '../middleware/isProfile.js'; // 확장자 추가

const router = express.Router();

// 심부름 등록하기 
router.get('/mylist',isAuth, useListController.findTask);

// 심부름 신청하기
router.get('/partner', isAuth, useListController.findPartnerTask);

export default router;