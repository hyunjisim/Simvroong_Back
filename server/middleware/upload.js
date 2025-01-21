import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config.js";

// S3 Client 설정
const s3Client = new S3Client({
  region: config.aws.bucket_region,
  credentials: {
    accessKeyId: config.aws.access_key,
    secretAccessKey: config.aws.secret_key,
  },  
});

// Multer 설정 (메모리 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

// S3 업로드 미들웨어
export const aws_s3_upload = async (req, res, next) => {
  upload(req, res, async (err) => {
    // Multer 에러 처리
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: "Multer file upload failed" });
    }

    // 파일 확인
    if (!req.file) {
      console.error("No file uploaded in multer");
      return res.status(400).json({ error: "No file uploaded in multer" });
    }

    // S3 업로드 설정
    const fileKey = `tasks/${uuidv4()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: config.aws.bucket_name,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    try {
      // S3 업로드 실행
      await s3Client.send(new PutObjectCommand(uploadParams));
      req.awsUploadPath = `https://${config.aws.bucket_name}.s3.${config.aws.bucket_region}.amazonaws.com/${fileKey}`;
      console.log("S3 업로드 성공:", req.awsUploadPath);

      // 다음 미들웨어로 이동
      next();
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload file to S3" });
    }
  });
};