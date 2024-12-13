import dotenv from 'dotenv'

// .env 파일을 프로세스를 통해 읽을 수 있게 함
dotenv.config()

function required(key, defaultValue = undefined) {
    // node.js에 procecss라고 하는 객체(os 관련). object 타입처럼 key, value로 읽어옴(.env안에 key('JWT_SECRET')를 통해 qwer1234#$%를 가져오게됨)
    const value = process.env[key] || defaultValue
    if (value == null) {
        throw new Error(`키 ${key}는 undefined!!`)
    }
    return value
}

export const config = {
    jwt: {
        secretKey: required('JWT_SECRET'), // qwer1234#$%
        expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 259200))
    },
    bcrypt: {
        saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 10))
    },
    host: {
        port: parseInt(required('HOST_PORT', 3000))
    },
    api: {
        apiKey: required('API_KEY'),
        apiSecretKey: required('API_SECRET'),
        hpNumber: required('MY_NUMBER')
    },
    db: {
        host: required('DB_HOST')
    }
}
