import Order from "../schema/TotalOrderDB.js";
import Favorite from "../schema/FavoriteDB.js"
import mongoose from "mongoose";

// 상세 페이지 불러오기
export async function getById(taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        console.error('유효하지 않은 ObjectId:', taskId);
        throw new Error('Invalid ObjectId format.');
    }

    try {
        const order = await Order.findOne({ taskId })
            .select('user_Id taskId title taskDetails location conditions partnerPreference schedule payment likes QnA createdAt updatedAt')
            .exec();
        if (!order) {
            return null;
        }

        return {
            user_id: order.user_Id,
            taskId: order.taskId,
            title: order.title,
            description: order.taskDetails.description,
            thumnail: order.taskDetails.thumnail,
            location: order.location,
            conditions: order.conditions,
            partnerPreference: order.partnerPreference,
            schedule: order.schedule,
            payment: order.payment,
            likesCount: order.likes.count,
            questionsCount: order.QnA.length,
            QnA: order.QnA,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    } catch (error) {
        console.error('Error fetching order by taskId:', error);
        throw error;
    }
}

export async function checkIfLiked(user_Id, taskId) {
    try {
        let isFavorite = false
        // Favorite 컬렉션에서 user_Id와 taskId로 조회
        const data = await Favorite.findOne({
            user_Id
        });
        const favorites = data.favorites
        for (const element of favorites) {
            if (element.taskId.equals(taskId)) {
                isFavorite = true;
                break; // 루프를 종료
            }
        }
        // 결과가 존재하면 true, 아니면 false 반환
        return isFavorite;
    } catch (error) {
        console.error('Error checking like status:', error);
        throw new Error('Failed to check like status');
    }
}


// 찜 추가 또는 삭제
export async function toggleFavorite(user_Id, taskId, isFavorite) {
    try {
        if (isFavorite) {
            await Favorite.findOneAndUpdate(
                { user_Id },
                { $addToSet: { favorites: { taskId } } },
                { upsert: true, new: true }
            );

            return await Order.findOneAndUpdate(
                { taskId },
                { $inc: { 'likes.count': 1 } }, // 좋아요 증가
                { new: true }
            ).exec();
        } else {
            await Favorite.findOneAndUpdate(
                { user_Id },
                { $pull: { favorites: { taskId } } },
                { new: true }
            );

            return await Order.findOneAndUpdate(
                { taskId },
                { $inc: { 'likes.count': -1 } }, // 좋아요 감소
                { new: true }
            ).exec();
        }
    } catch (error) {
        console.error('Error updating favorite:', error);
        throw error;
    }
}

// 질문 추가
export async function addQuestion(taskId, questionData, user_Id, nickname, photoUrl) {
    try {
        if (!user_Id) {
            throw new Error('addQuestion: user_Id가 정의되지 않았습니다.');
        }

        if (!questionData || !questionData.content) {
            throw new Error('addQuestion: 질문 내용이 누락되었습니다.');
        }

        const newQuestion = {
            photoUrl,
            nickname,
            userId: user_Id,
            content: questionData.content,
            createdAt: new Date(),
        };

        return await Order.findOneAndUpdate(
            { taskId },
            { $push: { QnA: { question: newQuestion } } }, // 질문 추가
            { new: true }
        )
        .populate('QnA.question.userId', 'nickname') // userId와 연결된 닉네임 가져오기
        .exec();
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
}

// 질문 수정
export async function updateQuestion(taskId, questionId, updatedContent, user_Id) {
    try {
        if (!updatedContent || !taskId || !questionId) {
            throw new Error('필수 매개변수가 누락되었습니다.');
        }

        // taskId에 해당하는 Order를 찾습니다.
        const order = await Order.findOne({ taskId });
        if (!order) {
            throw new Error('Order를 찾을 수 없습니다.');
        }

        // questionId를 기반으로 QnA 배열에서 질문을 찾습니다.
        const questionIndex = order.QnA.findIndex((q) => String(q._id) === String(questionId));
        if (questionIndex === -1) {
            throw new Error('질문을 찾을 수 없습니다.');
        }

        // 권한 확인 (userId 검사)
        const question = order.QnA[questionIndex].question;
        if (String(question.userId) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        // 질문 내용 업데이트
        const updateQuery = {};
        updateQuery[`QnA.${questionIndex}.question.content`] = updatedContent;

        return await Order.findOneAndUpdate(
            { taskId },
            { $set: updateQuery },
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error updating question:', error);
        throw error;
    }
}

export async function deleteQuestion(taskId, questionId, user_Id) {
    try {
        // Order에서 taskId에 해당하는 데이터 가져오기
        const order = await Order.findOne({ taskId });
        if (!order) {
            console.error('Order를 찾을 수 없습니다. taskId:', taskId);
            throw new Error('Order를 찾을 수 없습니다.');
        }

        // QnA 배열에서 questionId로 질문 찾기
        const question = order.QnA.find((q) => String(q._id) === String(questionId));
        if (!question) {
            console.error('질문을 찾을 수 없습니다. 전달된 questionId:', questionId);
            console.error('QnA 배열:', order.QnA.map((q) => String(q._id))); // 디버깅용 로그
            throw new Error('질문을 찾을 수 없습니다.');
        }

        // 권한 확인 (userId 검사)
        if (!question.question || String(question.question.userId) !== String(user_Id)) {
            console.error('권한이 없습니다. user_Id:', user_Id);
            throw new Error('권한이 없습니다.');
        }

        // 질문 삭제
        const updatedOrder = await Order.findOneAndUpdate(
            { taskId },
            { $pull: { QnA: { _id: questionId } } }, // _id로 질문 삭제
            { new: true }
        ).exec();

        if (!updatedOrder) {
            console.error('질문 삭제 중 문제가 발생했습니다.');
            throw new Error('질문 삭제 중 문제가 발생했습니다.');
        }

        console.log('질문 삭제 성공. 업데이트된 Order:', updatedOrder);
        return { message: '질문 삭제 성공', data: updatedOrder };
    } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
    }
}

// 답변 추가
export async function addAnswer(taskId, questionId, answerData, user_Id, nickname, photoUrl) {
    try {
        const order = await Order.findOne({ taskId });
        if (!order) throw new Error('Order not found.');

        const question = order.QnA.find((q) => String(q._id) === String(questionId));
        if (!question) throw new Error('Question not found.');

        // Add the reply to the answers array
        const newAnswer = {
            photoUrl,
            nickname,
            userId: user_Id,
            content: answerData.content,
            isRequester: answerData.isRequester || false,
            createdAt: new Date(),
        };

        question.answers.push(newAnswer);

        await order.save();
        return order;
    } catch (error) {
        console.error('Error adding answer:', error);
        throw error;
    }
}

export async function updateAnswer(taskId, questionId, answerId, updatedContent, user_Id) {
    try {
        // Order를 taskId로 가져옵니다.
        const order = await Order.findOne({ taskId });
        if (!order) throw new Error('Order not found.');

        // QnA 배열에서 questionId로 질문을 찾습니다.
        const question = order.QnA.find((q) => String(q._id) === String(questionId));
        if (!question) throw new Error('Question not found.');

        // answers 배열에서 answerId로 답변을 찾습니다.
        const answer = question.answers.find((a) => String(a._id) === String(answerId));
        if (!answer || String(answer.userId) !== String(user_Id)) {
            throw new Error('Unauthorized or answer not found.');
        }

        // 답변 내용을 수정합니다.
        answer.content = updatedContent;

        // 저장
        await order.save();

        return order;
    } catch (error) {
        console.error('Error updating answer:', error);
        throw error;
    }
}

// 답변 삭제
export async function deleteAnswer(taskId, questionId, answerId, user_Id) {
    try {
        // Order에서 taskId로 문서 찾기
        const order = await Order.findOne({ taskId });
        if (!order) throw new Error('Order를 찾을 수 없습니다.');

        // QnA 배열에서 questionId로 질문 찾기
        const question = order.QnA.find((q) => String(q._id) === String(questionId));
        if (!question) throw new Error('질문을 찾을 수 없습니다.');

        // answers 배열에서 answerId로 답변 찾기
        const answerIndex = question.answers.findIndex((a) => String(a._id) === String(answerId));
        if (answerIndex === -1) throw new Error('답변을 찾을 수 없습니다.');

        // 권한 확인
        const answer = question.answers[answerIndex];
        if (String(answer.userId) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        // 답변 삭제
        question.answers.splice(answerIndex, 1);

        // 변경된 Order 저장
        await order.save();

        return order;
    } catch (error) {
        console.error('Error deleting answer:', error);
        throw error;
    }
}