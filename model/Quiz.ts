import { Schema, model } from "mongoose";

const QuizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    timelimit: {
        type: Number
    },
    questionCount: {
        type: Number,
        default: 20,
        required: true
    },
    score: {
        type: Number
    },
    imagePath: {
        type: String
    },
    difficulty: {
        type: Number,
        default: 1
    }
});

const Quiz = model('Quiz', QuizSchema);
export default Quiz;