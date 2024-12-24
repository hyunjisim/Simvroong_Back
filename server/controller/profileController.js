import * as authRepository from '../query/authQuery.js'
import * as bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import { config } from '../config/config.js'
// import { sendTokenToSMS } from '../service/smsService.js'
import * as authController from './authController.js'

export async function userInfo(req, res, next) {
    const { password } = req.body
    const docodedToken = req.mongo_id

    const user = await authRepository.findUserbyToken(docodedToken)
    if (!user) {
        console.log('존재하지 않는 아이디')
        return res.status(401)
    }

    const PW_CHECK = password.length === 7 ? user.password === password : await bcrypt.compare(password, user.password)

    if (!PW_CHECK) {
        return res.status(401).json({ message: '비밀번호가 틀렸습니다' })
    }

    return res.sendStatus(200)
}

export async function modifyUserInfo(req, res, next) {
    const { decodeToken } = req.mongo_id
    const { nickname, userId, phoneNumber } = req.body

    await authRepository.modifyUser(nickname, userId, phoneNumber)
}

// export async function updatePhoto(req, res, next) {
//     const { nickaname } = req.body

// }

export async function updateNickname(req, res, next) {
    const { nickname, userId } = req.body

    const isNickname = await authRepository.duplicatedNickname(nickname, userId)

    if (isNickname) {
        return res.status(400).send('이미 존재하는 닉네임입니다')
    }

    return res.status(200).send('사용 가능한 닉네임입니다.')
}

// auth에서 만들어진 인증번호 전송, 확인부분 사용 이후
export async function updatePhoneNumber(req, res, next) {
    const { phoneNumber } = req.body

    const isVerified = await authRepository.checkVerified(phoneNumber)

    if (!isVerified) {
        return res.status(400).send('인증에 실패하셨습니다.')
    }

    return res.status(200).send('핸드폰 인증 완료')
}

export async function updatePassword(req, res, next) {
    const { nowPassword, newPassword } = req.body
    const { decodeToken } = req.mongo_id

    const user = await authRepository.findUserbyToken(decodeToken)
    if (!user) {
        return res.status(400).send('존재하지 않는 사용자 입니다.')
    }

    const PW_CHECK = nowPassword.length === 7 ? user.password === nowPassword : await bcrypt.compare(nowPassword, user.password)

    if (!PW_CHECK) {
        return res.status(400).send('현재 비밀번호가 일치하지 않습니다.')
    }

    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/

    if (!strongPasswordRegex.test(newPassword)) {
        return res.status(400).json({ success: false, message: '비밀번호는 8~15자 길이로, 문자, 숫자 및 특수문자를 포함해야 합니다.' })
    }

    if (await bcrypt.compare(newPassword, user.password)) {
        return res.status(400).json({ success: false, message: '새 비밀번호는 기존 비밀번호와 달라야 합니다.' })
    }

    const hashed = bcrypt.hashSync(newPassword, config.bcrypt.saltRounds)

    const modifiedPassword = await authRepository.updatePassword(user.userId, hashed)

    if (!modifiedPassword) {
        res.status(400).json({ success: false, message: '비밀번호 변경에 실패하였습니다' })
    }

    return res.status(200).send('비밀번호 변경이 완료되었습니다.')
}
