import { NextResponse, NextRequest } from "next/server";
import Result from "../../../../../model/Result";
import Quiz from "../../../../../model/Quiz";
import { dbConnect } from "../../../../../lib/connection";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get('quizId');

        if (!quizId) {
            return NextResponse.json({ success: false, errorMsg: "result key is required." }, { status: 400 });
        }

        const quizDetails = await Quiz.findById(quizId, {
            title: 1,
            category: 1
        });

        if (!quizDetails?.title || quizDetails.category) {
            return NextResponse.json({ success: false, errMsg: 'Quiz data incomplete' });
        }

        const result = await Result.find({ quizId: new mongoose.Types.ObjectId(quizId) });
        const quizResults = result.map((userResult) => ({
            _id: userResult._id,
            userId: userResult.userId,
            userName: userResult.username,
            score: userResult.score,
            totalScore: userResult.totalScore,
            completedAt: userResult.completedAt,
            quizTitle: quizDetails.title,
            category: quizDetails.category
        }))
        return NextResponse.json({ success: true, quizResults: quizResults });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false, errMsg: 'Unknown server error'});
    }
}