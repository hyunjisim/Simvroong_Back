import mongoose from 'mongoose';
import User from '../schema/UserSchema.js';

// **잔액 조회**
export async function account(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        res.status(200).json({ success: true, transactions: user.transactions });
    } catch (error) {
        console.error('거래 내역 조회 오류:', error);
        res.status(500).json({ success: false, message: '거래 내역 조회 중 오류가 발생했습니다.' });
    }
}

  // **충전 요청**
export async function charge(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    const { amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ success: false, message: '충전 금액이 유효하지 않습니다.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { $inc: { account: amount } }, // 잔액 증가
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 거래 기록 추가
        user.transactions.push({
            type: '충전',
            amount,
            date: new Date(),
        });

        await user.save();

        res.status(200).json({ success: true, account: user.account });
    } catch (error) {
        console.error('충전 오류:', error);
        res.status(500).json({ success: false, message: '충전 중 오류가 발생했습니다.' });
    }
}

  // **출금 요청**
export async function withdraw(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    const { amount } = req.body;
    if (amount <= 0) {
        return res.status(400).json({ success: false, message: '출금 금액이 유효하지 않습니다.' });
    }

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        if (user.account < amount) {
            return res.status(400).json({ success: false, message: '잔액이 부족합니다.' });
        }

        user.account -= amount; // 잔액 차감
        user.transactions.push({
            type: '출금',
            amount: -amount, // 음수 값으로 기록
            date: new Date(),
        });

        await user.save();

        res.status(200).json({ success: true, account: user.account });
    } catch (error) {
        console.error('출금 오류:', error);
        res.status(500).json({ success: false, message: '출금 중 오류가 발생했습니다.' });
    }
}

// 수익
export async function income(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    const { amount } = req.body;
    if (amount <= 0) {
        return res.status(400).json({ success: false, message: '수익 금액이 유효하지 않습니다.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { $inc: { account: amount } }, // 잔액 증가
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 거래 기록 추가
        user.transactions.push({
            type: '수익',
            amount,
            date: new Date(),
        });

        await user.save();

        res.status(200).json({ success: true, account: user.account });
    } catch (error) {
        console.error('수익 추가 오류:', error);
        res.status(500).json({ success: false, message: '수익 추가 중 오류가 발생했습니다.' });
    }
}

// 입금
export async function deposit(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    const { amount } = req.body;
    if (amount <= 0) {
        return res.status(400).json({ success: false, message: '입금 금액이 유효하지 않습니다.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { $inc: { account: amount } }, // 잔액 증가
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 거래 기록 추가
        user.transactions.push({
            type: '입금',
            amount,
            date: new Date(),
        });

        await user.save();

        res.status(200).json({ success: true, account: user.account });
    } catch (error) {
        console.error('입금 오류:', error);
        res.status(500).json({ success: false, message: '입금 중 오류가 발생했습니다.' });
    }
}