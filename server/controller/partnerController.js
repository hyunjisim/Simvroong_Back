import { encryptSSN } from "../middleware/partnershipMiddleware.js";
import Partner from '../schema/PartnerSchema.js'; // Partnership 모델 가져오기
import User from "../schema/UserSchema.js";
import calculateAgeGroup from "../middleware/partnershipMiddleware.js";


// 1단계: 주민등록번호, 신분증사진, 데이터 저장
export const partnerController = {
    applyPartnership1: async (req, res) => {
        try {
            const mongo_id = req.mongo_id;

            const { name, ssn } = req.body;

            console.log("요청 데이터:", req.body);
            console.log("업로드된 파일:", req.file);

            // 필수 입력값 확인
            if (!name || !ssn || !req.file) {
                return res.status(400).json({
                    code: "400",
                    msg: "필수 입력값을 모두 입력해주세요",
                });
            }

            // 주민등록번호 형식 검증
            const ssnRegex = /^\d{6}-\d{7}$/;
            if (!ssnRegex.test(ssn)) {
                return res.status(400).json({
                    code: "401",
                    msg: "주민등록번호 형식이 유효하지 않습니다",
                });
            }

            // 주민등록번호 암호화
            const hashedSSN = await encryptSSN(ssn, 10);

            // 신분증 사진 경로
            const idPhotoPath = req.file.path;

            // 기존 파트너 문서 검색
            let partner = await Partner.findOne({ userId: mongo_id });

            if (!partner) {
                // 문서가 없으면 새로 생성
                partner = new Partner({
                    userId: mongo_id,
                    personalInfo: {
                        hashedResidentId: hashedSSN,
                        name: name,
                    },
                    partnerStatus:{
                        isPartner:false,
                        status:"pending",
                    },
                    IDPhotoUrl: idPhotoPath,
                });
            } else {
                // 문서가 있으면 업데이트
                partner.personalInfo.hashedResidentId = hashedSSN;
                partner.personalInfo.name = name;
                partner.personalInfo.IDPhotoUrl = idPhotoPath;
                partner.partnerStatus.isPartner = false
                partner.partnerStatus.status = 'pending'
                partner.updatedAt = new Date();
            }

            // 저장
            await partner.save();

            res.status(201).json({
                code: "200",
                msg: "정보 제출 성공",
                partnerId: partner._id,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                code: "500",
                msg: "서버 오류가 발생했습니다",
                error: err.message, // 에러 메시지 반환
            });
        }
    },

    // 2단계: 정면 사진 업로드 처리
    applyPartnership2: async (req, res) => {
        try {
            const mongo_id = req.mongo_id;

            if (!req.file) {
                return res.status(400).json({ code: "400", msg: "정면 사진을 업로드해주세요." });
            }

            const facePhotoPath = req.file.path.replace(/\\/g, '/'); // 경로 변환
            const absolutePhotoUrl = `http://192.168.163.8:8080/${facePhotoPath}`;

            // 기존 파트너 문서 검색
            let partner = await Partner.findOne({ userId: mongo_id });

            if (!partner) {
                console.log("파트너십 가입 이력이 없습니다");
            } else {
                // 문서가 있으면 업데이트
                partner.facePhotoUrl = absolutePhotoUrl; // 절대 URL 저장
                partner.partnerStatus.isPartner = false
                partner.partnerStatus.status = 'pending'
                partner.updatedAt = new Date();
            }
            console.log("저장 직전 URL:", partner.facePhotoUrl);

            // 저장
            await partner.save();

            res.status(200).json({
                code: "200",
                msg: "정면 사진 업로드가 완료되었습니다.",
                data: partner,
            });
        } catch (err) {
            console.error("서버 오류 발생:", err);
            res.status(500).json({
                code: "500",
                msg: "서버 오류가 발생했습니다.",
            });
        }
    },

    // 3단계: 은행 정보 저장
    applyPartnership3: async (req, res) => {
        try {
            const mongo_id = req.mongo_id;
            console.log("mongo_id:",mongo_id)
            console.log("요청 데이터:", req.body);

            const { bankName, accountNumber, accountHolder } = req.body;

            if (!bankName || !accountNumber || !accountHolder) {
                return res.status(400).json({ error: "모든 필드를 입력해야 합니다." });
            }

            // 기존 파트너 문서 검색
            let partner = await Partner.findOne({ userId: mongo_id });

            if (!partner) {
                // 문서가 없으면 새로 생성
                console.log("파트너십 가입 이력이 없습니다");
            } else {
                // 문서가 있으면 업데이트
                partner.bankAccount = {
                    bankName,
                    accountNumber,
                    accountHolder,
                };
                partner.partnerStatus.isPartner = false
                partner.partnerStatus.status = 'pending'
                partner.updatedAt = new Date();
            }

            // 저장
            await partner.save();

            res.status(200).json({ message: "은행 정보가 성공적으로 저장되었습니다." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "서버 오류가 발생했습니다." });
        }
    },

    // 4단계: 수행 가능한 심부름 저장
    applyPartnership4: async (req, res) => {
        try {
            const mongo_id = req.mongo_id;

            console.log("요청 데이터:", req.body);
            const { services } = req.body;

            // 필수 입력값 검증
            if (!services || !Array.isArray(services)) {
                return res.status(400).json({ error: "유효하지 않은 입력값입니다." });
            }

            // 기존 파트너 문서 검색
            let partner = await Partner.findOne({ userId: mongo_id });

            if (!partner) {
                // 문서가 없으면 새로 생성
                console.log("파트너십 가입 이력이 없습니다");
            } else {
                // 심부름 종류 저장
                partner.servicesOffered = services;
                partner.partnerStatus.isPartner = false
                partner.partnerStatus.status = 'pending'
                partner.updatedAt = new Date();
            }

            await partner.save();

            res.status(200).json({ message: "수행 가능한 심부름이 성공적으로 저장되었습니다." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "서버 오류가 발생했습니다." });
        }
    },

    // getStep 5: 파트너,유저 데이터 가져오기
    getPartnershipStep5: async (req, res) => {
        const { mongo_id } = req;
        try {
            // User와 Partner 데이터를 가져옴
            const user = await User.findById(mongo_id);
            const partner = await Partner.findOne({ userId: mongo_id });

            if (!user) {
                return res.status(404).json({ error: "유저 데이터를 찾을 수 없습니다." });
            }

            // 응답 데이터 구성
            const nickname = user.nickname || "닉네임 없음";
            const gender = user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "성별 없음";
            const ageGroup = calculateAgeGroup(user.birth);
            const profileImage = partner?.facePhotoUrl
            ? (partner.facePhotoUrl.startsWith("http") ? partner.facePhotoUrl : `http://192.168.163.8:8080/${partner.facePhotoUrl}`)
            : user.photoUrl
            ? `http://192.168.163.8:8080/${user.photoUrl}`
            : "프로필 이미지 없음";
            const errands = partner?.servicesOffered || [];


            res.json({
                nickname,
                gender,
                ageGroup,
                profileImage,
                errands,
            });
            console.log(profileImage);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "서버 오류" });
        }
    },

    // 5단계: 사용자 정보를 업데이트
    applyPartnership5: async (req, res) => {
        try {
            const mongo_id = req.mongo_id;

            const { bio, transportation } = req.body;

            // 기존 파트너 문서 검색
            let partner = await Partner.findOne({ userId: mongo_id });

            if (!partner) {
                // 문서가 없으면 새로 생성
                console.log("파트너십 가입 이력이 없습니다");
            } else {
                // 업데이트 가능한 필드
                partner.profile.bio = bio || partner.profile.bio;
                partner.transportation = transportation || partner.transportation;
                partner.partnerStatus.isPartner = true
                partner.partnerStatus.status = 'complete'
                partner.updatedAt = new Date();
            }

            await partner.save();

            await User.findByIdAndUpdate(mongo_id, { isPartner: true})

            res.status(200).json({ message: "파트너십 상세 정보가 업데이트되었습니다.", partner });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "서버 오류가 발생했습니다." });
        }
    },
};

// 내정보와 프로필상세창에 쓰일 get
export async function getpartnerinfo(req, res, next){
    try {
        const mongo_id = req.mongo_id;
        // User와 Partner 데이터를 가져옴
        const user = await User.findById(mongo_id);
        const partner = await Partner.findOne({ userId: mongo_id });

        if (!user) {
            return res.status(404).json({ error: "유저 데이터를 찾을 수 없습니다." });
        }
        if (!partner) {
            return res.status(404).json({ error: "파트너 데이터를 찾을 수 없습니다." });
        }

        // 응답 데이터 구성
        const nickname = user.nickname || "닉네임 없음";
        const gender = user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "성별 없음";
        const ageGroup = calculateAgeGroup(user.birth);
        const profileImage = partner?.facePhotoUrl
        ? (partner.facePhotoUrl.startsWith("http") ? partner.facePhotoUrl : `http://192.168.163.8:8080/${partner.facePhotoUrl}`)
        : user.photoUrl
        ? `http://192.168.163.8:8080/${user.photoUrl}`
        : "프로필 이미지 없음";
        const errands = partner?.servicesOffered || [];
        const bio = partner?.profile.bio || [];
        const transportation = partner?.transportation || [];
        const partnerStatus = partner?.partnerStatus.status || "before join";

        res.json({
            nickname,
            gender,
            ageGroup,
            profileImage,
            errands,
            bio,
            transportation,
            partnerStatus,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "서버 오류" });
    }
}
