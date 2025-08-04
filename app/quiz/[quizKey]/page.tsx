"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Send } from 'lucide-react';
import { QuizData } from '../../../utilities/typeDefinitions';
import { useSendRequest } from '../../../utilities/axiosInstance';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import LoadingScreen from '../../../components/LoadingScreen';
import QuizIdenticationForm from '@/components/IdentityForm';

interface UserAnswers {
    [questionIndex: string]: number;
}

interface QuizSubmissionData {
    username: string;
    numberId: string | number;
    quizId: string;
    answers: UserAnswers;
    timeSpent: number;
    completedAt: string;
}

interface UserData {
    username: string;
    numberId: string | number;
}

const QuizPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const quizkey = Array.isArray(params.quizKey) ? params.quizKey[0] : params.quizKey;

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [timeRemaining, setTimeRemaining] = useState<number>(1800);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [quizResult, setResults] = useState<string | null>(null);
    const [isAuthenicated, setAuthencated] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData>({
        username: '',
        numberId: ''
    })

    const { sendRequest } = useSendRequest();

    useEffect(() => {
        if (!quizkey) return;

        const fetchQuiz = async () => {
            try {
                const result = await sendRequest({
                    config: {
                        method: 'GET',
                        url: `/api/quiz/fetchQuestions?quizkey=${quizkey}`
                    }
                });

                if (result && result.success) {
                    setQuizData(result.quizData);
                } else {
                    console.error("Failed to load quiz.");
                }
            } catch (err) {
                console.error("API error:", err);
            }
        };

        fetchQuiz();
    }, [quizkey]);

    useEffect(() => {
        if (timeRemaining > 0 && !isSubmitted) {
            const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && !isSubmitted) {
            handleSubmitQuiz();
        }
    }, [timeRemaining, isSubmitted]);

    useEffect(() => {
        if (quizData) setSelectedAnswer(userAnswers[quizData?.questions[currentQuestion]._id] ?? null);
    }, [currentQuestion, userAnswers]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (optionIndex: number): void => {
        setSelectedAnswer(optionIndex);
    };

    const handleNext = (): void => {
        if (selectedAnswer !== null && quizData) {
            setUserAnswers(prev => ({
                ...prev,
                [quizData?.questions[currentQuestion]._id]: selectedAnswer
            }));

            if (quizData && currentQuestion < quizData.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
            }
        }
    };

    const handleSubmitQuiz = async (): Promise<void> => {
        if (!quizData) return;

        const finalAnswers: UserAnswers =
            selectedAnswer !== null
                ? { ...userAnswers, [quizData?.questions[currentQuestion]._id]: selectedAnswer }
                : userAnswers;

        const submissionData: QuizSubmissionData = {
            ...userData,
            quizId: quizkey ?? '',
            answers: finalAnswers,
            timeSpent: 1800 - timeRemaining,
            completedAt: new Date().toISOString()
        };

        try {
            await submitToServer(submissionData);
            setUserAnswers(finalAnswers);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    const submitToServer = async (submissionData: QuizSubmissionData): Promise<void> => {
        // console.log(submissionData);

        try {
            const result = await sendRequest({
                config: {
                    method: 'POST',
                    url: '/api/quiz/submit',
                    data: submissionData
                }
            });

            if (result && result.success) {
                setResults(result.resultId);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleConfirmSubmit = (): void => {
        console.log(userData);
        setShowConfirmation(false);
        handleSubmitQuiz();
    };

    const getProgressPercentage = (): number => {
        return quizData ? ((currentQuestion + 1) / quizData.questions.length) * 100 : 0;
    };

    const getAnsweredCount = (): number => {
        return Object.keys(userAnswers).length;
    };

    const showResults = () => {
        router.push(`/quiz/result/${quizResult}`);
    }

    if (!quizkey || !quizData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-700 text-gray-500">
                <LoadingScreen />
            </div>
        );
    }

    const currentQuestionData = quizData.questions[currentQuestion];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Submitted Successfully!</h1>
                    <p className="text-gray-600 text-lg mb-8">
                        Your answers have been recorded and sent to the server. You&apos;ll receive your results shortly.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{getAnsweredCount()}</div>
                                <div className="text-sm text-gray-600">Questions Answered</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{formatTime(1800 - timeRemaining)}</div>
                                <div className="text-sm text-gray-600">Time Taken</div>
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={quizResult === null}
                        onClick={() => showResults()} 
                        className={`font-semibold py-3 px-8 rounded-lg transition-colors duration-200
                                ${quizResult === null ? 
                                    "bg-gray-300 hover:bg-gray-200 text-black" : 
                                    'bg-purple-600 hover:bg-purple-700 text-white '}
                            `}
                    >
                        View Results
                    </button>
                </div>
            </div>
        );
    }

    console.log(currentQuestionData);

    return (
        <div className="min-h-screen bg-white">
            {!isAuthenicated && (
                <QuizIdenticationForm userInput={userData} hideForm={setAuthencated} storeFormValues={setUserData} />
            )}
            <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">{quizData.title}</h1>
                            <p className="text-purple-200 text-sm">
                                Question {currentQuestion + 1} of {quizData.totalQuestions}
                            </p>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                <span className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-300' : ''}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            {timeRemaining < 300 && (
                                <div className="flex items-center text-red-300">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Time running out!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="bg-purple-700 rounded-full h-2">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                                Question {currentQuestion + 1}
                            </span>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
                            {currentQuestionData.question}
                        </h2>
                    </div>

                    <div className="space-y-4 mb-8">
                        {currentQuestionData.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full text-black text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                    selectedAnswer === index
                                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                        selectedAnswer === index
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedAnswer === index && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-lg">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            {getAnsweredCount()} of {quizData.totalQuestions} questions answered
                        </div>

                        <div className="flex space-x-4">
                            {currentQuestion < quizData.questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={selectedAnswer === null}
                                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                        selectedAnswer !== null
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
                                >
                                    Submit Quiz
                                    <Send className="w-4 h-4 ml-2" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Quiz?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to submit your quiz? You have answered {getAnsweredCount()} out of {quizData.totalQuestions} questions.
                            You won&apos;t be able to change your answers after submission.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <ToastContainer position='bottom-right' />
            </div>
        </div>
    );
};

export default QuizPage;
