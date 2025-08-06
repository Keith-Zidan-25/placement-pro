import { NextResponse, NextRequest } from "next/server";
import Quiz from "../../../../model/Quiz";
import Question from "../../../../model/Questions";
import { QuizData } from "../../../../utilities/typeDefinitions";
import { dbConnect } from "../../../../lib/connection";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const quizkey = searchParams.get('quizkey');

        if (!quizkey) {
            return NextResponse.json({ success: false, errorMsg: "Quiz key is required." }, { status: 400 });
        }

        const quizDetails = await Quiz.findById(quizkey);
        if (!quizDetails) {
            return NextResponse.json({ success: false, errorMsg: "Quiz not found." }, { status: 404 });
        }

        const quizObjectId = new mongoose.Types.ObjectId(quizDetails._id)

        const questions = await Question.aggregate([
            { $match: { quizId: quizObjectId } },
            { $sample: { size: quizDetails.questionCount || 20 } },
            {
                $project: {
                    question: 1,
                    options: ['$optionA', '$optionB', '$optionC', '$optionD']
                }
            }
        ]);

        const quizData: QuizData = {
            title: quizDetails.title,
            totalQuestions: quizDetails.questionCount,
            duration: quizDetails.timelimit,
            score: quizDetails.score,
            questions: questions
        };

        return NextResponse.json({ success: true, quizData });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, errorMsg: "Server error" }, { status: 500 });
    }
}
