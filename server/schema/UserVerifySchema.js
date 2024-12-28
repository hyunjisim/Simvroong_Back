import { virtualId } from '../query/connectDBQuery.js'
import mongoose from 'mongoose'

const User_verify_Schema = new mongoose.Schema({
    phone: {
        number: { type: String, required: true }, // 휴대폰 번호
        verified: { type: Boolean, default: false },
        verificationCode: { type: String } // 발송된 인증번호
    }
})

virtualId(User_verify_Schema)

const UserVerify = mongoose.model('Verify', User_verify_Schema)

export default UserVerify
