// // 파트너십 가입 1단계 스키마
// //MongoDB의 데이터 구조를 정의
// const mongoose = require('mongoose')

// // mongoose.Schema: MongoDB에 저장될 데이터 구조를 정의합니다.
// // name, ssn, email: 필수 입력 필드로 설정했습니다.
// // status: 파트너십 신청 상태를 나타냅니다. 기본값은 'pending'으로 설정했습니다.
// // created_at: 데이터 생성 시간을 자동으로 기록합니다

// // 파트너십 가입 1단계 스키마(신분증 사진,이름,민증번호,메일 주소 입력,전송 페이지)
// const PartnershipSchema1 = new mongoose.Schema({
//     name: { type: String, required: true }, // 실명, 필수 입력
//     ssn: { type: String, required: true }, // 주민등록번호, 필수 입력
//     email: { type: String, required: true }, // 이메일, 필수 입력
//     id_photo_path: { type: String, required: true }, // 신분증 사진 파일 경로, 필수 입력
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     // 신청 상태 ('pending', 'approved', 'rejected' 중 하나), 기본값은 'pending'
//     created_at: { type: Date, default: Date.now } // 신청 날짜, 기본값은 현재 시간
// })

// // 파트너십 가입 2단계 스키마 (정면 사진 입력,전송 페이지)
// const PartnershipSchema2 = new mongoose.Schema({
//     profile_photo_path: { type: String, required: true }, // 신분증 사진 파일 경로, 필수 입력
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     // 신청 상태 ('pending', 'approved', 'rejected' 중 하나), 기본값은 'pending'
//     created_at: { type: Date, default: Date.now } // 신청 날짜, 기본값은 현재 시간
// })

// module.exports = mongoose.model('Partnership', PartnershipSchema1, PartnershipSchema2)
