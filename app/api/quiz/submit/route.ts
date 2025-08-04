import { NextResponse, NextRequest } from "next/server";
import Question from "../../../../model/Questions";
import Quiz from "../../../../model/Quiz";
import Result from "../../../../model/Result";
import { dbConnect } from "../../../../lib/connection";
import { checkServerStatus } from "../../../../lib/apiserver";
import mongoose, { ObjectId } from "mongoose";

type StringKeyObject = {
    [key: string]: number
}

type AnswerObject = {
    _id: ObjectId,
    question: string,
    answer: string
}

const answerValueMap: StringKeyObject = { "A": 0, "B": 1, "C": 2, "D": 3 };

type Category = {
    category: string;
    correct: number;
    total: number;
    percentage: number;
    isStrong: boolean;
};

function analysisMapper(correctTopics: [string, number][],incorrectTopics: [string, number][]): Category[] {
    const topicMap: Record<string, { correct: number; incorrect: number }> = {};

    // console.log("Mapper Inputs:\n")
    // console.log(correctTopics, incorrectTopics);

    if (correctTopics && correctTopics.length > 0) {
        for (const [topic, count] of correctTopics) {
            if (!topicMap[topic]) {
                topicMap[topic] = { correct: 0, incorrect: 0 };
            }
            topicMap[topic].correct += count;
        }
    }

    if (incorrectTopics && incorrectTopics.length > 0) {
        for (const [topic, count] of incorrectTopics) {
            if (!topicMap[topic]) {
                topicMap[topic] = { correct: 0, incorrect: 0 };
            }
            topicMap[topic].incorrect += count;
        }
    }

    const categories: Category[] = Object.entries(topicMap).map(([topic, { correct, incorrect }]) => {
        const total = correct + incorrect;
        const percentage = total > 0 ? (correct / total) * 100 : 0;
        const isStrong = percentage >= 70;

            return {
                category: topic,
                correct,
                total,
                percentage,
                isStrong,
            };
        }
    );
    // console.log(`Mapper Output: ${categories}`);

    return categories;
}


async function analyseStrongAndWeakTopics(correctlyAnswered: AnswerObject[], incorrectlyAnswered: AnswerObject[]): Promise<Category[]> {
    
    return new Promise(async (resolve, reject) => {
        try {
            let result;
            if (!await checkServerStatus()) {
                reject('Unable to connect to the server or server shut down');
            }

            // console.log(correctlyAnswered, incorrectlyAnswered);

            const SERVER_URL = process.env.FASTAPI_SERVER_URL;
            const correctlyAnsweredResponse = await fetch(`${SERVER_URL}/api/quiz/analyse-answers`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(correctlyAnswered)
            }).then(response => {

                if (!response.ok) {
                    throw new Error('Correctly answered questions analysis failed');
                }
                return response.json();
            });

            const incorrectlyAnsweredResponse = await fetch(`${SERVER_URL}/api/quiz/analyse-answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(incorrectlyAnswered)
            }).then(response => {

                if (!response.ok) {
                    throw new Error('Incorrectly answered questions analysis failed');
                }
                return response.json();
            });

            if (!correctlyAnsweredResponse || !incorrectlyAnsweredResponse) {
                console.error("Missing one of the responses");
                reject('Missing response');
            }

            if (correctlyAnsweredResponse.success !== true || incorrectlyAnsweredResponse.success !== true) {
                result = analysisMapper(
                    (correctlyAnsweredResponse.success ? correctlyAnsweredResponse.analysis.topics : []), 
                    (incorrectlyAnsweredResponse.success ? incorrectlyAnsweredResponse.analysis.topics : [])
                )
            } else {
                result = analysisMapper(correctlyAnsweredResponse.analysis.topics, incorrectlyAnsweredResponse.analysis.topics);
            }

            resolve(result);

        } catch (err) {
            console.log(err);
            reject('An Error Occured')
        }
    });
}

async function calculateResult(userAnswers: StringKeyObject, actualAnswers: AnswerObject[]) {
    const answers = Object.values(userAnswers);
    const correctlyAnswered = [], incorrectlyAnswered = [];

    let score = 0
    for (let i = 0; i < answers.length; i++) {
        const stringOptionIndex = actualAnswers[i];
        const stringId = String(stringOptionIndex._id)
        console.log(`option Index: ${stringOptionIndex._id}:${stringOptionIndex.answer} users: ${userAnswers[stringId]}`);

        if (answerValueMap[stringOptionIndex.answer] === userAnswers[stringId]) {
            score += 1;
            correctlyAnswered.push(stringOptionIndex);
        } else {
            incorrectlyAnswered.push(stringOptionIndex);
        }
    }

    const analysis = await analyseStrongAndWeakTopics(correctlyAnswered, incorrectlyAnswered);

    // if (typeof analysis === 'string') {
    //     return { score: score, completeSuccess: false };
    // }

    return { score: score, completeSuccess: true, category: analysis };
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { username, numberId, quizId, answers, timeSpent, completedAt } = await req.json();
        const stringIds = Object.keys(answers);
        const objectIds = []

        // console.log(answers);

        for (let i = 0; i < stringIds.length; i++) {
            objectIds.push(new mongoose.Types.ObjectId(stringIds[i]));
        }

        const actualAnswers = await Question.aggregate([
            { $match: { _id: { $in: objectIds }}},
            { 
                $project: {
                    question: 1,
                    answer: 1
                }
            }
        ]);

        const quizDetails = await Quiz.findOne({
            _id: new mongoose.Types.ObjectId(quizId)
        }, {
            questionCount: 1,
        });

        const result = await calculateResult(answers, actualAnswers);
        // console.log(score);

        if (!result.completeSuccess) {
            
        }

        const ResultData = {
            quizId: quizId,
            userId: numberId,
            username: username,
            score: result.score,
            totalScore: quizDetails?.questionCount,
            percentage: (result.score / (quizDetails?.questionCount ? quizDetails?.questionCount : objectIds.length)) * 100,
            completedAt: completedAt,
            categoryBreakdown: result.category
        }

        const resultDoc = new Result(ResultData);
        await resultDoc.save()

        return NextResponse.json({ success: true, resultId: resultDoc._id });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false, errMsg: 'Unknown server error'});
    }
}