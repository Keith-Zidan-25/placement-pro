import { NextResponse, NextRequest } from "next/server";
import Result from "../../../../model/Result";
import { dbConnect } from "../../../../lib/connection";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const resultId = searchParams.get('resultId');

        if (!resultId) {
            return NextResponse.json({ success: false, errorMsg: "result key is required." }, { status: 400 });
        }

        const result = await Result.findById(resultId);
        
        return NextResponse.json({ sucess: true, quizResult: result });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false, errMsg: 'Unknown server error'});
    }
}