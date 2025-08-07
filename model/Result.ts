import { Schema, model, models } from "mongoose";

// interface Category {
//     category: string;
//     correct: number;
//     total: number;
//     isStrong: boolean;
// }

const ResultSchema = new Schema({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    score: {
        type: Number,
        required: true
    },
    totalScore: {
        type: Number,
        required: true   
    },
    percentage: {
        type: Number,
        required: true
    },
    completedAt: {
        type: String,
        required: true
    },
    categoryBreakdown: [{
            category: { 
                type: String, 
                required: true 
            },
            correct: { 
                type: Number, 
                required: true 
            },
            total: { 
                type: Number, 
                required: true 
            },
            percentage: { 
                type: Number, 
                required: true 
            },
            isStrong: { 
                type: Boolean, 
                required: true 
            }
        }
    ]
});

const Result = models.Result || model('Result', ResultSchema);
export default Result;