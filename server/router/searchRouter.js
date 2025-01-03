import express from 'express'
import * as searchController from '../controller/searchController.js'
import { isAuth } from '../middleware/isProfile.js'; // 확장자 추가

const router = express.Router();

// 제목 검색하기(일부만 써도 됨, 단 맞춤법은 고려)
router.get('/', isAuth,searchController.findSearch);

// 최근 검색어 요청
router.get('/recent', isAuth,searchController.recentSearch);

// 인기 검색어 요청
// router.get('/most', searchController.mostSearch)

export default router;