import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/connection";
import Quiz from "../../../../model/Quiz";
import Question from "../../../../model/Questions";

interface QuestionType {
    question?: string;
    Question?: string;
    optionA?: string;
    'Option A'?: string;
    optionB?: string;
    'Option B'?: string;
    optionC?: string;
    'Option C'?: string;
    optionD?: string;
    'Option D'?: string;
    answer?: string;
    Answer?: string;
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { title, description, timelimit, questionCount, score, imagePath, difficulty, questions } = await req.json();
        const quizData = {
            title: title,
            description: description,
            timelimit: timelimit,
            questionCount: questionCount,
            score: score,
            imagePath: imagePath,
            difficulty: difficulty,
            category: description
        }

        const newQuiz = new Quiz(quizData);
        await newQuiz.save();

        const questionsWithId = questions.map((q: QuestionType) => ({
            ...q,
            quizId: newQuiz._id
        }));

        await Question.insertMany(questionsWithId);

        return NextResponse.json({ success: true, message: 'Quiz created', quizId: newQuiz._id });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false, errMsg: 'Unknown server error' });
    }
}