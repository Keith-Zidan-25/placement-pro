import { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    question: {
        type: String,
        required: true
    },
    optionA: {
        type: String,
        required: true
    },
    optionB: {
        type: String,
        required: true
    },
    optionC: {
        type: String,
        required: true
    },
    optionD: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});

const Question = models.Question || model('Question', QuestionSchema);
export default Question;