"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Target, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown, BarChart3, PieChart, 
    RefreshCw, Download, Share2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useParams } from 'next/navigation';
import { useSendRequest } from '../../../../utilities/axiosInstance';

interface QuizResult {
    _id?: string;
    quizId: string;
    quizTitle: string;
    userId: string;
    userName: string;
    score: number;
    totalScore: number;
    percentage: number;
    completedAt: string;
    categoryBreakdown: CategoryResult[];
}

interface CategoryResult {
    category: string;
    correct: number;
    total: number;
    percentage: number;
    isStrong: boolean;
}

const QuizResultsPage: React.FC = () => {
    const resultId = useParams()?.resultId;
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [quizResult, setQuizResult] = useState<QuizResult>({
        quizId: '',
        quizTitle: '',
        userId: '',
        userName: '',
        score: 0,
        totalScore: 0,
        percentage: 0,
        completedAt: '',
        categoryBreakdown: []
    });
    const [fetchError, setFetchError] = useState<boolean>(false);
    const {sendRequest} = useSendRequest();

    useEffect(() => {
        const fetchResult = async () => {
            if (!resultId) return;

            try {
                const result = await sendRequest({
                    config: {
                        method: 'GET',
                        url: `/api/quiz/result?resultId=${resultId}`
                    }
                });

                if (result && result.success) {
                    setQuizResult(result.quizResult);
                }
            } catch (err) {
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchResult()
    }, []);

    if (!loading && fetchError) {
        return (
            <div className='min-h-screen bg-gray-50 text-center'>
                <p className='text-black'>Couldn&apos;nt find your quiz result</p>
            </div>
        )
    }


    const getGradeInfo = (percentage: number) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const gradeInfo = getGradeInfo(quizResult.percentage);
    const strongCategories = quizResult.categoryBreakdown.filter(cat => cat.isStrong);
    const weakCategories = quizResult.categoryBreakdown.filter(cat => !cat.isStrong);


    const categoryData = quizResult.categoryBreakdown.map(cat => ({
        name: cat.category,
        percentage: cat.percentage,
        correct: cat.correct,
        total: cat.total,
        fill: cat.percentage > 50 ? '#10b981' : '#ef4444'
    }));

    const pieChartData = [
        { name: 'Correct', value: quizResult.score, fill: '#10b981' },
        { name: 'Incorrect', value: quizResult.totalScore - quizResult.score, fill: '#ef4444' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                            <p className="text-purple-200">{quizResult.quizTitle}</p>
                            <p className="text-purple-300 text-sm">
                                Completed on {new Date(quizResult.completedAt).toLocaleDateString()}
                            </p>
                        </div>
                        {/* <div className="flex space-x-3">
                            <button className="flex items-center px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </button>
                            <button className="flex items-center px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-4 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                        <div className={`px-3 py-1 rounded-full ${gradeInfo.bgColor} ${gradeInfo.color} font-bold`}>
                            {gradeInfo.grade}
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex-1">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                {quizResult.score}/{quizResult.totalScore}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div 
                                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${quizResult.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-60">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-3">
                        <Clock className="w-6 h-6 text-blue-500 mr-2" />
                        <h3 className="font-semibold text-gray-900">Time Taken</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                        {formatTime(quizResult.timeSpent)}
                    </div>
                    <div className="text-sm text-gray-600">
                        of {formatTime(quizResult.timeLimit)}
                    </div>
                </div> */}
            </div>

            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-8">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-md transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-purple-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="w-full bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" height={100} />
                            <YAxis />
                            <Tooltip labelClassName='text-black'/>
                            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeTab === 'analysis' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Strong Areas</h3>
                        </div>
                        <div className="space-y-3">
                            {strongCategories.length > 0 ? strongCategories.map((category, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium text-green-800">{category.category}</span>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">{category.percentage}%</div>
                                        <div className="text-sm text-green-600">{category.correct}/{category.total}</div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 italic">No strong areas identified. Keep practicing!</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <TrendingDown className="w-6 h-6 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                        </div>
                        <div className="space-y-3">
                            {weakCategories.length > 0 ? weakCategories.map((category, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <span className="font-medium text-red-800">{category.category}</span>
                                    <div className="text-right">
                                        <div className="font-bold text-red-600">{category.percentage}%</div>
                                        <div className="text-sm text-red-600">{category.correct}/{category.total}</div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 italic">Great job! No weak areas identified.</p>
                            )}
                        </div>
                    </div>
                </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                        <div className="space-y-3">
                            {weakCategories.length > 0 && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Study Focus Areas:</h4>
                                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                                        {weakCategories.map((category, index) => (
                                            <li key={index}>
                                            Focus on {category.category} - scored {category.percentage}%
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-800 mb-2">Next Steps:</h4>
                                <ul className="list-disc list-inside text-purple-700 space-y-1">
                                    <li>Review questions you got wrong</li>
                                    <li>Practice more questions in weak areas</li>
                                    <li>Take another quiz to track improvement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* {activeTab === 'questions' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                <div className="space-y-4">
                {quizResult.questionResults.slice(0, 5).map((question, index) => (
                    <div key={question.questionId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                        Q{index + 1}. {question.question}
                        </h4>
                        <div className="flex items-center space-x-2">
                        {question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                        <span className="font-medium">Your Answer: </span>
                        <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {question.userAnswer}
                        </span>
                        </div>
                        <div>
                        <span className="font-medium">Correct Answer: </span>
                        <span className="text-green-600">{question.correctAnswer}</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Category: {question.category}
                    </div>
                    </div>
                ))}
                {quizResult.questionResults.length > 5 && (
                    <div className="text-center py-4">
                    <button className="text-purple-600 hover:text-purple-700 font-medium">
                        View All Questions
                    </button>
                    </div>
                )}
                </div>
            </div>
            )} */}

            {/* <div className="flex justify-center space-x-4 mt-8">
            <button className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
            </button>
            <button className="flex items-center px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-colors">
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
            </button>
            </div> */}
        </div>
        </div>
    );
};

export default QuizResultsPage;