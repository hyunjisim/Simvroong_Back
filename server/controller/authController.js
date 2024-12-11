import * as authRepository from '../query/authQuery.js'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { sendTokenToSMS } from '../service/smsService.js'

// token값 반환
async function createJwtToken(id) {
    return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec })
}

export async function signup(req, res, next) {
    const { nickname, userid, password, name, birth, gender, hp } = req.body
    // 회원 중복 체크
    const found = await authRepository.findByuserId(userid)
    if (found) {
        return res.status(409).json({ message: `해당 아이디가 이미 존재합니다` })
    }

    // 비밀번호 암호화
    const hashed = bcrypt.hashSync(password, config.bcrypt.saltRounds)

    // 회원가입 정보에 맞게 생성
    await authRepository.createUser({
        nickname,
        userid,
        password: hashed,
        name,
        birth,
        gender,
        hp
    })
    res.status(201)
}

export async function login(req, res, next) {
    const { userid, password } = req.body
    // 아이디 중복 체크
    const user = await authRepository.findById(userid)
    if (!user) {
        return res.status(401).send('아이디를 찾을 수 없음')
    }

    // 사용자가 입력한 비밀번호와 DB에 저장되어있는 hash비밀번호를 decode 해서 비교
    const PW_CHECK = await bcrypt.compare(password, user.password)
    // 비밀번호 체크
    if (!PW_CHECK) {
        return res.status(401).json({ message: '아이디 또는 비밀번호 확인' })
    }
    const token = await createJwtToken(user.userid)
    res.status(200).json({ token, userid })
}

export async function findId(req, res, next) {
    const { name, hp } = req.body

    const hpCheck = await sendTokenToSMS(hp)

    if (!hpCheck) {
        return res.status(401).send('핸드폰 인증에 실패하셨습니다')
    }

    const user = await authRepository.findIdByName(name)
    if (!user) {
        return res.status(401).send('등록된 아이디 없음')
    }

    return res.status(201).json({ "userid": user})
}

export async function findPw() {}

export async function verify(req, res, next) {
    const token = req.header['Token'] // header를 까봤을 때 Token이라는 항목을확인
    if (token) {
        res.status(200).json(token)
    }
}

export async function me(req, res, next) {
    const user = await authRepository.findById(req.userid)
    if (!user) {
        return res.status(404).json({ message: '사용자가 없음' })
    }
    res.status(200).json({ token: req.token, username: user.username })
}
