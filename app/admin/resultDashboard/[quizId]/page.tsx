"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Award, Clock, Search, Filter, FileX } from 'lucide-react';
import { useSendRequest } from '../../../../utilities/axiosInstance';
import { useParams } from 'next/navigation';

interface QuizResult {
    _id: string;
    userId: string;
    userName: string;
    score: number;
    totalScore: number;
    completedAt: string;
    quizTitle: string;
    category: string;
}

const AdminQuizDashboard: React.FC = () => {
    const quizId = useParams()?.quizId;
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const {sendRequest} = useSendRequest();

    useEffect(() => {
        if (!quizId) return;

        const fetchResults = async () => {
            try {
                const result = await sendRequest({
                    config: {
                        method: 'GET',
                        url: `/api/quiz/result/fetchAll?quizId=${quizId}`
                    }
                });

                if (result && result.success) {
                    setQuizResults(result.quizResults);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, []);

    const statistics = useMemo(() => {
        if (quizResults.length === 0) return null;

        const totalAttempts = quizResults.length;
        const uniqueUsers = new Set(quizResults.map(result => result.userId)).size;

        const averageScore = Math.round(
            quizResults.reduce((sum, result) => sum + (result.score / result.totalScore) * 100, 0) / totalAttempts
        );

        const scoreDistribution = quizResults.reduce((acc, result) => {
            const percentage = (result.score / result.totalScore) * 100;
            
            if (percentage >= 90) acc.excellent++;
            else if (percentage >= 70) acc.good++;
            else if (percentage >= 50) acc.average++;
            else acc.poor++;

            return acc;
        }, { excellent: 0, good: 0, average: 0, poor: 0 });

        const categoryStats = quizResults.reduce((acc, result) => {
            const category = result.category;
            if (!acc[category]) {
                acc[category] = { count: 0, totalScore: 0 };
            }
            acc[category].count++;
            acc[category].totalScore += (result.score / result.totalScore) * 100;
            return acc;
        }, {} as Record<string, { count: number; totalScore: number }>);

        const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
            category,
            averageScore: Math.round(stats.totalScore / stats.count),
            attempts: stats.count,
            fill: Math.round(stats.totalScore / stats.count) > 50 ? '#10b981' : '#DC143C'
        }));

        const scoreDistributionData = [
            { name: 'Excellent (90-100%)', value: scoreDistribution.excellent, color: '#10b981' },
            { name: 'Good (70-89%)', value: scoreDistribution.good, color: '#FFD700' },
            { name: 'Average (50-69%)', value: scoreDistribution.average, color: '#ADD8E6' },
            { name: 'Poor (<50%)', value: scoreDistribution.poor, color: '#DC143C' }
        ];

        return {
            totalAttempts,
            uniqueUsers,
            averageScore,
            categoryData,
            scoreDistributionData
        };
    }, [quizResults]);

    const filteredResults = useMemo(() => {
        return quizResults.filter(result => {
            const matchesSearch = result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || result.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [quizResults, searchTerm, categoryFilter]);

    const categories = [...new Set(quizResults.map(result => result.category))];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!loading && quizResults.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FileX className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results found</h3>
                    <p className="text-gray-600">Please wait for your students to finish or try again later!!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-purple-700 border-b border-black shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-black">Quiz Admin Dashboard</h1>
                            <p className="text-black mt-1">Monitor and analyze quiz performance</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-black" />
                                <input
                                    type="text"
                                    placeholder="Search users, quizzes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white text-black pl-10 pr-4 py-2 border border-black rounded-lg focus:ring-2 focus:ring-white focus:border-white"
                                />
                            </div>
                            {/* <div className="relative">
                                <Filter className="absolute left-3 top-3 h-4 w-4 text-black" />
                                <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-white text-black pl-10 pr-8 py-2 border border-black rounded-lg focus:ring-2 focus:ring-white focus:border-white"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div> */}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white border border-gray-700 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-white rounded-lg">
                                    <Users className="h-6 w-6 text-black" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-black">Total Users</p>
                                    <p className="text-2xl font-bold text-purple-900">{statistics.uniqueUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-700 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-white rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-black" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-black">Average Score</p>
                                    <p className={`text-2xl font-bold ${
                                        statistics.averageScore > 75 ? `text-green-700` : 
                                            statistics.averageScore > 50 ? 'text-yellow-400' : 'text-red-700'
                                        }`}>
                                            {statistics.averageScore}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-700 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-white rounded-lg">
                                    <Award className="h-6 w-6 text-black" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-black">Total Attempts</p>
                                    <p className="text-2xl font-bold text-purple-900">{statistics.totalAttempts}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {statistics && (
                        <div className="bg-white border border-gray-700 rounded-lg p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-black mb-4">Performance by Category</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statistics.categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="category"  />
                                    <YAxis />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #A855F7',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="averageScore" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {statistics && (
                        <div className="bg-white border border-gray-700 rounded-lg p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-black mb-4">Score Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statistics.scoreDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {statistics.scoreDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #A855F7',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700 bg-purple-50">
                        <h3 className="text-lg font-semibold text-black">Quiz Results ({filteredResults.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-purple-200">
                            <thead className="bg-purple-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-700">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-700">
                                        Quiz
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-700">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Completed At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-700">
                                {filteredResults.map((result, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-700">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-black">{result.userName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black border-r border-gray-700">
                                            {result.quizTitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-black">
                                                    {result.score}/{result.totalScore}
                                                </div>
                                                <div className="ml-2 text-sm text-black">
                                                    ({Math.round((result.score / result.totalScore) * 100)}%)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            {new Date(result.completedAt).toLocaleDateString()} {new Date(result.completedAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminQuizDashboard;