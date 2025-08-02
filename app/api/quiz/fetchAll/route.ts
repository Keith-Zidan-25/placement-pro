import { NextResponse } from "next/server";
import Quiz from "../../../../model/Quiz";
import { dbConnect } from "../../../../lib/connection";

export async function GET() {
    try {
        await dbConnect();

        const quizzes = await Quiz.find();
        return NextResponse.json({ success: true, quizzes: quizzes });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false, errMsg: 'Unknown Server error' });
    }
}