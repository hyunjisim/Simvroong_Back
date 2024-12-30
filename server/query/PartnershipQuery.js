import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User의 _id를 참조
    profile: {
        bio: { type: String, maxlength: 3000, default: '' }, // 간단한 자기소개
        photoUrl: { type: String, default: '' }, // 프로필 사진 URL (2단계에서 촬영된 사진을 저장)
    },
    servicesOffered: { // 제공 가능한 심부름
        type: [String], 
        default: [], 
        validate: {
            validator: function(value) {
                return value.length > 0 // 최소 1개 이상의 값이 있어야 함
            },
            message: '최소 하나 이상의 서비스를 선택해야 합니다.' // 검증 실패 시 메시지
        }
    },
    transportation: { 
        type: [String],
        default: [], 
        validate: {
            validator: function(value) {
                return value.length > 0 // 최소 1개 이상의 값이 있어야 함
            },
            message: '최소 하나 이상의 교통수단을 선택해야 합니다.' // 검증 실패 시 메시지
        }
    }, // 교통수단 (복수 선택 가능)
    activityCount: { type: Number, default: 0 }, // 활동 수
    requestCount: { type: Number, default: 0 }, // 요청 수
    reviewCount: { type: Number, default: 0 }, // 리뷰 수
    bankAccount: {
        bank: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank', required: true }, // 은행 참조
        accountNumber: { type: String, default: '' }, // 계좌 번호
        accountHolder: { type: String, default: '' } // 계좌 주인 이름
    },
    partnerStatus: {
        isPartner: { type: Boolean, default: false }, // 파트너 여부
        status: { type: String, default: 'pending' } // 현재 상태, 가입x/승인대기/승인완료
    },
    personalInfo: {
        hashedResidentId: { type: String } // 주민등록번호 해시값
    },
    locationInformation: {
        location: { type: String, default: '' }, // 위치 정보
        account: { type: String, default: '' } // 위치 관련 계정 정보
    },
    facePhotoUrl: { type: String, required: true }, // 2단계에서 촬영된 본인 얼굴 사진 URL
    createdAt: { type: Date, default: Date.now }, // 생성 일시
    updatedAt: { type: Date, default: Date.now } // 수정 일시
});

const Partner = mongoose.model('Partner', PartnerSchema);

export default Partner;
