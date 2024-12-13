import mongoose from 'mongoose'
import { virtualId } from './connectDBQuery.js'

const UserSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true }, // 닉네임
    userId: { type: String, required: true, unique: true }, // 아이디
    password: { type: String, required: true }, // 비밀번호 (해시)
    name: { type: String, required: true }, // 이름
    birth: { type: Date, required: true }, // 생년월일
    gender: { type: String, enum: ['male', 'female'], required: true }, // 성별
    phone: {
        number: { type: String, required: true, unique: true }, // 휴대폰 번호
        verified: { type: Boolean, default: false } // 인증 여부
    },
    isPartner: { type: Boolean, default: false },
    termsAgreed: {
        // 약관 동의 정보
        requiredTerms: { type: Boolean, default: true}, // 필수 약관 동의
        optionalTerms: { type: Boolean, default: false } // 선택 약관 동의
    },
    createdAt: { type: Date, default: Date.now }, // 가입 일시
    updatedAt: { type: Date, default: Date.now } // 마지막 수정 일시
})

const User_verify_Schema = new mongoose.Schema({
    phone: {
        number: { type: String, required: true }, // 휴대폰 번호
        verified: { type: Boolean, default: false },
        verificationCode: { type: String } // 발송된 인증번호
    }
})

virtualId(User_verify_Schema)
virtualId(UserSchema)

// User모델 생성
const User = mongoose.model('User', UserSchema)
const UserVerify = mongoose.model('Verify', User_verify_Schema)

export async function createUser(user) {
    return new User(user).save().then(data => data._id)
}

export async function setCode(phoneNumber, code) {
    const result = await UserVerify.create({ 'phone.number': phoneNumber, 'phone.verificationCode': code })

    // 결과에 따른 메시지 출력
    if (result.matchedCount === 0) {
        console.error(`No user found with phone number: ${phoneNumber}`)
        return { success: false, message: 'No user found with the provided phone number.' }
    }

    return { success: true, message: 'Verification code updated successfully.' }
}

export async function getCode(phoneNumber) {
    const user = await UserVerify.findOne({ 'phone.number': phoneNumber })
    if (!user) {
        return null
    }
    await UserVerify.updateOne({ 'phone.number': phoneNumber }, { $set: { 'phone.verified': true } })
    return user ? user.phone.verificationCode : null
}

export async function checkVerified(phoneNumber) {
    const user = await UserVerify.findOne({ 'phone.number': phoneNumber })
    return user.phone.verified ? user.phone.verified : false
}

export async function deleteVerify(phoneNumber) {
    const user = await UserVerify.findOne({ 'phone.number': phoneNumber })
    return UserVerify.findByIdAndDelete(user._id)
}

export async function findUserById(userid) {
    const user = await User.findOne({ 'userId' : userid})
    return user ? user : null
}
