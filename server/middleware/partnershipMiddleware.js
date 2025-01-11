import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

// 공통 함수로 파일 이름 생성
const generateFilename = (file) => Date.now() + path.extname(file.originalname);

// 업로드 설정 생성 함수
export function createUploader(uploadPath = "uploads") {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => cb(null, generateFilename(file)),
    });

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedExtensions = /jpeg|jpg|png/;
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowedExtensions.test(ext)) {
                cb(null, true);
            } else {
                cb(new Error('이미지 파일만 업로드 가능합니다.'));
            }
        },
    });
}


// 주민등록번호 암호화 함수
export async function encryptSSN(ssn, saltRounds = 10) {
    try {
        return await bcrypt.hash(ssn, saltRounds);
    } catch (error) {
        throw new Error("암호화 과정에서 문제가 발생했습니다.");
    }
}

// 파트너 데이터 로드 및 검증 미들웨어
export const loadPartner = async (req, res, next) => {
    try {
        const mongo_id = req.mongo_id; // 토큰에서 추출한 사용자 ID

        // Partner 데이터 로드
        const partner = await Partner.findOne({ userId: mongo_id }).populate('userId');
        if (!partner) {
            return res.status(404).json({ message: '파트너 데이터를 찾을 수 없습니다.' });
        }

        // Partner 데이터를 요청 객체에 저장
        req.partner = partner;

        // 다음 단계로 진행
        next();
    } catch (error) {
        console.error("Error loading partner:", error);
        res.status(500).json({ message: '파트너 데이터를 가져오는 중 오류가 발생했습니다.' });
    }
};

// utils/calculateAgeGroup.js
function calculateAgeGroup(birthDate) {
    if (!birthDate) return "연령대 없음";
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < 20) return "10대";
    if (age < 30) return "20대";
    if (age < 40) return "30대";
    if (age < 50) return "40대";
    return "50대 이상";
}

export default calculateAgeGroup;