import { NextResponse, NextRequest } from "next/server";
import Question from "../../../../model/Questions";
import { dbConnect } from "../../../../lib/connection";
import mongoose, { ObjectId } from "mongoose";

type StringKeyObject = {
    [key: string]: number
}

type AnswerObject = {
    _id: ObjectId,
    answer: string
}

const answerValueMap: StringKeyObject = { "A": 0, "B": 1, "C": 2, "D": 3 }

async function calculateScore(userAnswers: StringKeyObject, correctAnswers: AnswerObject[]) {
    const answers = Object.values(userAnswers);

    let score = 0
    for (let i = 0; i < answers.length; i++) {
        const stringOptionIndex = correctAnswers[i];
        const stringId = String(stringOptionIndex._id)
        // console.log(`option Index: ${stringOptionIndex._id}:${stringOptionIndex.answer} users: ${userAnswers[stringId]}`);

        if (answerValueMap[stringOptionIndex.answer] === userAnswers[stringId]) {
            score += 1;
        }
    }

    return score;
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { quizId, answers, timeSpent, completedAt } = await req.json();
        const stringIds = Object.keys(answers);
        const objectIds = []

        // console.log(answers);

        for (let i = 0; i < stringIds.length; i++) {
            objectIds.push(new mongoose.Types.ObjectId(stringIds[i]));
        }

        const correctAnswers = await Question.aggregate([
            { $match: { _id: { $in: objectIds }}},
            { 
                $project: {
                    answer: 1
                }
            }
        ]);

        const score = await calculateScore(answers, correctAnswers);
        // console.log(score);

        return NextResponse.json({ success: true, score: score });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: true, errMsg: 'Unknown server error'});
    }
}