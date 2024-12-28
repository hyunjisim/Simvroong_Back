import * as authRepository from '../query/authQuery.js'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { sendTokenToSMS } from '../service/smsService.js'

// token값 반환
async function createJwtToken(id) {
    return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec })
}

export async function registerUser(req, res, next) {
    const { nickname, userId, password, name, birth, gender, phoneNumber, agreements } = req.body

    const isUserId = await authRepository.findUserById(userId)

    if (isUserId) {
        return res.status(400).send('이미 존재하는 아이디입니다')
    }

    const isNickname = await authRepository.duplicatedNickname(nickname)

    if (isNickname) {
        return res.status(400).send('사용중이 닉네임입니다.')
    }

    const isChecked = await authRepository.checkVerified(phoneNumber)

    if (!isChecked) {
        return res.status(400).send('핸드폰 인증이 안된 사용자입니다')
    }

    const hashed = bcrypt.hashSync(password, config.bcrypt.saltRounds)

    await authRepository.createUser({
        nickname,
        userId,
        password: hashed,
        name,
        birth,
        gender,
        phone: {
            number: phoneNumber,
            verified: isChecked
        },
        termsAgreed: {
            requiredTerms: true,
            optionalTerms: true //agreements.check4
        }
    })
    return res.status(201).send({ message: '회원가입 성공!' })
}

export async function sendCode(req, res, next) {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: '전화번호를 입력해주세요.' })
    }

    const code = await sendTokenToSMS(phoneNumber) // 1234

    const isSave = await authRepository.setCode(phoneNumber, code)

    if (!isSave) {
        return res.status(404).send('저장실패')
    }

    return res.status(204).send('저장성공')
}

export async function verifyCode(req, res, next) {
    const { phoneNumber, code } = req.body // 1234

    const isVerified = await authRepository.getCode(phoneNumber)

    if (code !== isVerified) {
        return res.status(401).send('인증번호가 틀렸습니다')
    }

    return res.status(204).send(`존재하는 유저 : 인증번호 (${isVerified})`)
}

// LoginPage
export async function login(req, res, next) {
    const { userId, password } = req.body
    // 아이디 중복 체크
    const user = await authRepository.findUserById(userId)
    if (!user) {
        return res.status(401).send('아이디를 찾을 수 없음')
    }

    // 사용자가 입력한 비밀번호와 DB에 저장되어있는 hash비밀번호를 decode 해서 비교
    const PW_CHECK = password.length === 7 ? user.password === password : await bcrypt.compare(password, user.password)

    // 비밀번호 체크
    if (!PW_CHECK) {
        return res.status(401).json({ message: '아이디 또는 비밀번호 확인' })
    }

    const token = await createJwtToken(user._id)

    return res.status(200).json({ token })
}

export async function findId(req, res, next) {
    const { name, phoneNumber } = req.body

    const user = await authRepository.findIdByPhoneNumber(name, phoneNumber)

    if (!user) {
        return res.status(401).send('등록된 아이디 없음')
    }

    return res.status(201).json({ user: user })
}

export async function findPw(req, res, next) {
    const { userId, phoneNumber } = req.body

    const user = await authRepository.findPwByInfo(userId, phoneNumber)

    if (!user) {
        return res.status(401).send('등록된 아이디 없음')
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const special = '@$!%*?&'

    let tempPw = ''

    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        tempPw += characters[randomIndex]
        if (i == 4) {
            for (let j = 0; j < 2; j++) {
                const randomIndex = Math.floor(Math.random() * special.length)
                tempPw += special[randomIndex]
            }
            break
        }
    }

    const updatedUserPw = await authRepository.updatePassword(userId, tempPw)

    return res.status(201).json({ tempPassword: updatedUserPw.password })
}

export async function verify(req, res, next) {
    const token = req.header['Token'] // header를 까봤을 때 Token이라는 항목을확인
    if (token) {
        res.status(200).json(token)
    }
}

// export async function me(req, res, next) {
//     const user = await authRepository.findById(req.userid)
//     if (!user) {
//         return res.status(404).json({ message: '사용자가 없음' })
//     }
//     res.status(200).json({ token: req.token, username: user.username })
// }
