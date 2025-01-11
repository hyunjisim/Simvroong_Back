import { virtualId } from '../query/connectDBQuery.js';
import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User의 _id를 참조 (required 제거)
    profile: {
        bio: { type: String, maxlength: 3000, default: '' }, // 간단한 자기소개
        photoUrl: { type: String, default: '' }, // 프로필 사진 URL
    },
    servicesOffered: { 
        type: [String],
        default: [], // 제공 가능한 심부름
    },
    transportation: { 
        type: [String],
        default: [], // 교통수단 (복수 선택 가능)
    },
    activityCount: { type: Number, default: 0 }, // 활동 수
    requestCount: { type: Number, default: 0 }, // 요청 수
    reviewCount: { type: Number, default: 0 }, // 리뷰 수
    bankAccount: {
        bankName: { type: String, default: '' }, // 은행
        accountNumber: { type: String, default: '' }, // 계좌 번호
        accountHolder: { type: String, default: '' } // 계좌 주인 이름
    },
    partnerStatus: {
        isPartner: { type: Boolean, default: false }, // 파트너 여부
        status: { type: String, default: 'before join' } // 현재 상태
        //before join,pending,complete세개로 나뉨 관리자 페이지 없어서 pending,complete이 두개만 일단 사용
    },
    personalInfo: {
        hashedResidentId: { type: String }, // 주민등록번호 해시값
        name: {type: String},
        IDPhotoUrl: {type: String},
    },
    locationInformation: {
        location: { type: String, default: '' }, // 위치 정보
        account: { type: String, default: '' }, // 위치 관련 계정 정보
    },
    facePhotoUrl: { type: String }, // 2단계에서 촬영된 본인 얼굴 사진 URL (required 제거)
    createdAt: { type: Date, default: Date.now }, // 생성 일시
    updatedAt: { type: Date, default: Date.now }, // 수정 일시
});

virtualId(PartnerSchema);
const Partner = mongoose.model('Partner', PartnerSchema);

export default Partner;
