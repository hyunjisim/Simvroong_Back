import { virtualId } from '../query/connectDBQuery.js'
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true }, // 닉네임
    userId: { type: String, required: true, unique: true }, // 아이디
    password: { type: String, required: true }, // 비밀번호 (해시)
    name: { type: String, required: true }, // 이름
    photoUrl: { type: String, default: 'https://res.cloudinary.com/dxvt4iugh/image/upload/v1735498268/aa_qwvdo9.png' },
    birth: { type: Date, required: true }, // 생년월일
    gender: { type: String, enum: ['male', 'female'], required: true }, // 성별
    phone: {
        number: { type: String, required: true, unique: true }, // 휴대폰 번호
        verified: { type: Boolean, default: false } // 인증 여부
    },
    isPartner: { type: Boolean, default: false },
    termsAgreed: {
        // 약관 동의 정보
        requiredTerms: { type: Boolean, default: true }, // 필수 약관 동의
        optionalTerms: { type: Boolean, default: false } // 선택 약관 동의
    },
    createdAt: { type: Date, default: Date.now }, // 가입 일시
    updatedAt: { type: Date, default: Date.now }, // 마지막 수정 일시
    isBlocked: { type: Boolean, default: false }, // 사용자의 차단 상태
    blockedAt: { type: Date, default: null } // 차단된 날짜
})

virtualId(UserSchema)

// User모델 생성
const User = mongoose.model('User', UserSchema)

export default User
