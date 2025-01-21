import express from 'express';
import * as orderController from '../controller/orderController.js';
import * as oneOrderController from '../controller/oneOrderController.js'
import { isAuth } from '../middleware/isProfile.js'
import { aws_s3_upload } from "../middleware/upload.js";
import multer from "multer";

const router = express.Router();
const upload = multer().none();

// 심부름 만들기
router.post('/create', isAuth, upload, orderController.createOrder);

// S3 이미지 업로드
router.post("/upload", isAuth, aws_s3_upload, (req, res) => {
    console.log("S3 업로드 경로 확인:", req.awsUploadPath); // 경로 확인 로그 추가
    if (req.awsUploadPath) {
        return res.status(200).json({ url: req.awsUploadPath });
    }
    console.error("S3 업로드 실패 또는 파일 없음.");
    return res.status(400).json({ message: "No file provided or upload failed." });
});

// 상세 페이지 가져오기
router.get('/:taskId', isAuth, oneOrderController.getOrderById);

// 찜 상태 패치
router.post('/:taskId', isAuth, oneOrderController.getLikeStatus);

// 상세 페이지에서 찜기능과 Q&A
router.patch('/:taskId', isAuth, oneOrderController.manageController);


export default router;
