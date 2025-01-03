import express from 'express';
import { partnerController } from '../controller/partnerController.js'
import { getpartnerinfo } from '../controller/partnerController.js'
import { createUploader } from "../middleware/partnershipMiddleware.js";
import { isAuth } from '../middleware/isProfile.js'

const router = express.Router()

// 사진 업로드 설정
const idPhotoUpload = createUploader('uploads/ids');
const facePhotoUpload = createUploader('uploads/faces');
// 파트너 데이터 가져오기
// router.get("/data", partnerController.data)

// 파트너십 가입 요청 1단계: 신분증 사진과 개인정보 저장
router.post("/step1", idPhotoUpload.single("idPhoto"),isAuth, partnerController.applyPartnership1)

router.post("/step2",facePhotoUpload.single("facePhoto"),isAuth, partnerController.applyPartnership2)

// // 3단계: 은행 정보 저장
router.post("/step3",isAuth, partnerController.applyPartnership3)

// // 4단계: 수행 가능한 심부름 저장
router.post("/step4",isAuth, partnerController.applyPartnership4)

// Step 5: 파트너 데이터 가져오기
router.get("/step5", isAuth, partnerController.getPartnershipStep5);

// // 5단계: 자기소개,이동수단 저장
router.post("/step5",isAuth,partnerController.applyPartnership5)

// 프로필에 넘겨야되는 get일단 테스트용으로 여기 넣어둠
router.get("/getpartner", isAuth,getpartnerinfo);

export default router;

