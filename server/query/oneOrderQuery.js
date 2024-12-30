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
            .select('taskId title taskDetails location conditions partnerPreference schedule payment likes QnA createdAt updatedAt')
            .exec();

        if (!order) {
            return null;
        }

        return {
            taskId: order.taskId,
            title: order.title,
            description: order.taskDetails.description,
            photoUrl: order.taskDetails.photoUrl,
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
export async function addQuestion(taskId, questionData, user_Id) {
    try {
        if (!user_Id) {
            throw new Error('addQuestion: user_Id가 정의되지 않았습니다.');
        }

        if (!questionData) {
            throw new Error('addQuestion: questionData가 정의되지 않았습니다.');
        }

        questionData.user_Id = user_Id; // 현재 사용자 ID 추가
        return await Order.findOneAndUpdate(
            { taskId },
            { $push: { QnA: { question: questionData } } }, // 질문 추가
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
}

// 질문 수정
export async function updateQuestion(taskId, questionIndex, updatedContent, user_Id) {
    try {
        const order = await Order.findOne({ taskId });
        const question = order.QnA[questionIndex]?.question;

        if (!question || String(question.user_Id) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        const updateQuery = {};
        updateQuery[`QnA.${questionIndex}.question.content`] = updatedContent;

        return await Order.findOneAndUpdate(
            { taskId },
            { $set: updateQuery }, // 질문 내용 수정
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error updating question:', error);
        throw error;
    }
}

// 질문 삭제
export async function deleteQuestion(taskId, questionIndex, user_Id) {
    try {
        const order = await Order.findOne({ taskId });
        const question = order.QnA[questionIndex]?.question;

        if (!question || String(question.user_Id) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        // 질문 삭제
        const unsetResult = await Order.findOneAndUpdate(
            { taskId },
            { $unset: { [`QnA.${questionIndex}`]: 1 } }, // 해당 질문 제거
            { new: true }
        ).exec();

        // 배열에서 null 값 제거
        return await Order.findOneAndUpdate(
            { taskId },
            { $pull: { QnA: null } }, // null 값 제거
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
    }
}

// 답변 추가
export async function addAnswer(taskId, questionIndex, answerData, user_Id) {
    try {
        answerData.user_Id = user_Id; // 현재 사용자 ID 추가
        const updateQuery = {};
        updateQuery[`QnA.${questionIndex}.answers`] = answerData;

        return await Order.findOneAndUpdate(
            { taskId },
            { $push: updateQuery }, // 답변 추가
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error adding answer:', error);
        throw error;
    }
}

// 답변 수정
export async function updateAnswer(taskId, questionIndex, answerIndex, updatedContent, user_Id) {
    try {
        const order = await Order.findOne({ taskId });
        const answer = order.QnA[questionIndex]?.answers[answerIndex];

        if (!answer || String(answer.user_Id) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        const updateQuery = {};
        updateQuery[`QnA.${questionIndex}.answers.${answerIndex}.content`] = updatedContent;

        return await Order.findOneAndUpdate(
            { taskId },
            { $set: updateQuery }, // 답변 내용 수정
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error updating answer:', error);
        throw error;
    }
}

// 답변 삭제
export async function deleteAnswer(taskId, questionIndex, answerIndex, user_Id) {
    try {
        const order = await Order.findOne({ taskId });
        const answer = order.QnA[questionIndex]?.answers[answerIndex];

        if (!answer || String(answer.user_Id) !== String(user_Id)) {
            throw new Error('권한이 없습니다.');
        }

        // 답변 삭제
        await Order.findOneAndUpdate(
            { taskId },
            { $unset: { [`QnA.${questionIndex}.answers.${answerIndex}`]: 1 } }, // 해당 답변 제거
            { new: true }
        ).exec();

        // 배열에서 null 값 제거
        return await Order.findOneAndUpdate(
            { taskId },
            { $pull: { [`QnA.${questionIndex}.answers`]: null } }, // null 값 제거
            { new: true }
        ).exec();
    } catch (error) {
        console.error('Error deleting answer:', error);
        throw error;
    }
}