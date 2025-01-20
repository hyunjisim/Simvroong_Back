import mongoose from 'mongoose';

const OrderApplicationSchema = new mongoose.Schema({
    user_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 신청한 사용자 ID
    acceptedPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null }, // 심부름 수락한 파트너 아이디
    isAccepted: { type: Boolean, default: false }, // 심부름 수락 상태
    taskId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // 자동 생성
    title: { type: String, maxlength: 100, trim: true, required: true }, // 심부름 제목
    category: {
        type: String,
        enum: ['전체', '배달·퀵', '청소·집안일', '설치·수리', '이사·운반', '대행', '알바', '반려동물', '돌봄·육아', '기타'],
        default: '기타',
        required: true
    },
    taskDetails: {
        description: { type: String, maxlength: 500 }, // 심부름 요청 내용
        thumnail: { type: String, default: '' } // 요청에 첨부된 사진 URL
    },
    location: {
        area: { type: String, required: true }, // 주소 (예: "서울시 강남구")
        detailedAddress: { type: String, required: true }, // 상세 주소 (예: "역삼동 123-45")
        extraNotes: { type: String, default: '' } // 기타 위치 관련 요청 사항
    },
    conditions: {
        hasCCTV: { type: Boolean, default: false }, // CCTV 여부
        hasAnimals: { type: Boolean, default: false }, // 애완동물 여부
        partnerParkingAvailable: { type: Boolean, default: false } // 파트너 주차 가능 여부
    },
    partnerPreference: {
        gender: { type: String, enum: ['무관', '남성', '여성'], default: '무관' }, // 선호 파트너 성별
        ageRange: { type: String, default: '' }, // 선호 파트너 연령대
        otherPreferences: { type: String, default: '' } // 기타 선호 조건
    },
    schedule: {
        date: { type: Date, required: true }, // 예약 날짜
        time: { type: String, required: true }, // 예약 시간 (예: "14:00")
        estimatedDuration: { type: String, required: true } // 예상 소요 시간 (예: "2시간")
    },
    calenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' }, // 연결된 캘린더 ID
    payment: { 
        serviceFee: { type: Number, required: true},
        minFee: { type: Number, required: true } 
    },
    isFeeNegotiable: { type: Boolean, default: false }, // 금액 제안 허용 여부
    suggestedFee: {
        amount: { type: Number, min: 0, default: null }, // 파트너가 제안한 금액
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // 금액을 제안한 파트너 ID
        proposedAt: { type: Date, default: null } // 금액 제안 날짜
    },
    likes: { // 찜 상태
        count: { type: Number, default: 0 }, // db에 저장될 좋아요 갯수
        favoriteTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Favorite', default: null } 
    },
    QnA: [ // Q&A 필드
        {
            question: {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                nickname : { type: String },
                photoUrl : { type: String },
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                content: { type: String },
                createdAt: { type: Date, default: Date.now }
            },
            answers: [
                {
                    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                    nickname : { type: String },
                    photoUrl : { type: String },
                    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    content: { type: String },
                    isRequester: { type: Boolean, default: false },
                    createdAt: { type: Date, default: Date.now }
                }
            ]
        }
    ],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }], // 신고 데이터 참조
    isCompleted: { type: Boolean, default: false }, // 완료 여부
    isActive: { type: String, enum:['거래완료', '진행중',' '], default:' ' }, // 활성화 상태
    createdAt: { type: Date, default: Date.now }, // 생성일
    updatedAt: { type: Date, default: Date.now } // 수정일
})

const Order = mongoose.model('Order', OrderApplicationSchema);

export default Order;