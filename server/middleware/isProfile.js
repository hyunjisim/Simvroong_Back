import jwt, { decode } from 'jsonwebtoken'
import * as authRepository from '../query/authQuery.js'
import { config } from '../config/config.js'

const AUTH_ERROR = { message: '인증에러' }

export const isAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization')
    if (!(authHeader && authHeader.startsWith('Bearer '))) {
        console.log('헤더 에러')
        return res.status(401).json(AUTH_ERROR)
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
        if (error) {
            console.log('토큰 에러')
            return res.status(401).json(AUTH_ERROR)
        }
        const user = await authRepository.findUserbyToken(decoded.id)
        if (!user) {
            console.log('존재하지 않는 아이디')
            return res.status(401).json(AUTH_ERROR)
        }
        req.mongo_id = user._id
        next()
    })
}
