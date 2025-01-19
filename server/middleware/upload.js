import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config.js";

const s3Client = new S3Client({
  region: config.aws.bucket_region,
  credentials: {
    accessKeyId: config.aws.access_key,
    secretAccessKey: config.aws.secret_key,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

export const aws_s3_upload = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: "File upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileKey = `tasks/${uuidv4()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: config.aws.bucket_name,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      req.awsUploadPath = `https://${config.aws.bucket_name}.s3.${config.aws.bucket_region}.amazonaws.com/${fileKey}`;
      console.log("File uploaded successfully:", req.awsUploadPath);
      next();
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload file to S3" });
    }
  });
};
