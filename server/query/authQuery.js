import User from '../schema/UserSchema.js'
import UserVerify from '../schema/userVerifySchema.js'
import { v2 as cloudinary } from 'cloudinary'

export async function createUser(user) {
    deleteVerify(user.phone.number)
    return new User(user).save().then(data => data._id)
}

export async function setCode(phoneNumber, code) {
    const reSend = await UserVerify.findOne({ 'phone.number': phoneNumber })
    if (reSend) {
        deleteVerify(phoneNumber)
    }
    const result = await UserVerify.create({ 'phone.number': phoneNumber, 'phone.verificationCode': code })

    // 결과에 따른 메시지 출력
    if (result.matchedCount === 0) {
        return { success: false, message: '인증번호 전송 실패' }
    }

    return { success: true, message: '인증번호가 전송되었습니다' }
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
    try {
        const user = await UserVerify.findOne({ 'phone.number': phoneNumber })
        return user.phone.verified ? user.phone.verified : false
    } catch {
        return false
    }
}

export async function deleteVerify(phoneNumber) {
    const user = await UserVerify.findOne({ 'phone.number': phoneNumber })
    return UserVerify.findByIdAndDelete(user._id)
}

export async function findUserById(userId) {
    const user = await User.findOne({ userId: userId })
    return user ? user : null
}

export async function duplicatedNickname(nickname, userId) {
    const isDuplicate = await User.findOne({ nickname, userId: { $ne: userId } })
    return isDuplicate ? ture : false
}

export async function findIdByPhoneNumber(name, phoneNumber) {
    const user = await User.findOne({
        name: name,
        'phone.number': phoneNumber
    })
    if (user) {
        deleteVerify(phoneNumber)
    }
    return user ? user : null
}

export async function findPwByInfo(userId, phoneNumber) {
    const user = await findUserById(userId)
    if (user) {
        deleteVerify(phoneNumber)
    }
    return user ? user : null
}

export async function updatePassword(userId, newPw) {
    const newPwUser = await User.findOneAndUpdate({ userId: userId }, { $set: { password: newPw } }, { new: true })

    return newPwUser ? newPwUser : null
}

export async function findUserbyToken(decodedToken) {
    // console.log("findUserbyToken - decodedToken:", decodedToken); // decodedToken 값 확인
    const user = await User.findById(String(decodedToken));
    // console.log("findUserbyToken - 찾은 유저:", user); // 반환된 유저 확인
    return user ? user : null;
}

export async function modifyUser(newNickname, userId, newPhoneNumber) {
    const user = await User.findOne({ userId: userId })
    if (!newNickname && newPhoneNumber) {
        const modifiedUser = await User.findOneAndUpdate({ userId: userId }, { $set: { nickname: user.nickname, 'phone.number': newPhoneNumber } }, { new: true })
        return modifiedUser
    } else if (newNickname && !newPhoneNumber) {
        const modifiedUser = await User.findOneAndUpdate({ userId: userId }, { $set: { nickname: newNickname, 'phone.number': user.phone.number } }, { new: true })
        return modifiedUser
    } else if (!newNickname && !newPhoneNumber) {
        return true
    }
    const modifiedUser = await User.findOneAndUpdate({ userId: userId }, { $set: { nickname: newNickname, 'phone.number': newPhoneNumber } }, { new: true })
    return modifiedUser
}

export async function updateProfileImage(userId, imageUrl) {
    const user = await User.findById(userId)

    if (user.photoUrl) {
        const publicId = user.photoUrl.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
    }

    // 새로운 URL로 업데이트
    return User.findByIdAndUpdate(userId, { $set: { photoUrl: imageUrl } }, { new: true })
}
