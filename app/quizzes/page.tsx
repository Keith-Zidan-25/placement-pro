"use client"

import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useSendRequest } from '../../utilities/axiosInstance';

type Quiz = {
    _id: string,
    title: string,
    description: string,
    image: string
}

const QuizzesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const {sendRequest} = useSendRequest();
    const router = useRouter();

    const linkList = [
        { name: "Home", url: "/" },
        { name: "About Us", url: "#about" },
        { name: "Contact", url: "#contact" }
    ];

    const categories = ['All', 'Programming', 'Frontend', 'System Design', 'Database', 'AI/ML'];

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const result = await sendRequest({
                    config: {
                        method: 'GET',
                        url: '/api/quiz/fetchAll'
                    }
                });

                if (result && result.success) {
                    setQuizzes(result.quizzes);
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchQuizzes()
    }, [])

    const startQuiz = (quizKey: string) => {
        router.push(`/quiz/${quizKey}`)
    }

    // const getDifficultyColor = (difficulty: string) => {
    //     switch (difficulty) {
    //         case 'Beginner': return 'bg-green-100 text-green-800';
    //         case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    //         case 'Advanced': return 'bg-red-100 text-red-800';
    //         default: return 'bg-gray-100 text-gray-800';
    //     }
    // };

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-black py-5 w-full top-0 z-50 shadow-md">
                <Navbar linkList={linkList} className={'text-white'}/>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search quizzes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-black pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-3 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map((quiz) => (
                        <div key={quiz._id} className={`bg-gray-50 rounded-lg overflow-hidden shadow-lg`}>
                            <div className="w-full h-48">
                                <img src={quiz.image} alt={quiz.title} className="w-full h-full object-cover bg-center" />
                            </div>
                                <div className="p-4 flex flex-col gap-2 w-full">
                                    <h3 className="text-lg font-semibold text-black">{quiz.title}</h3>
                                        <p className="text-gray-700">{quiz.description}</p>
                                        <button onClick={() => startQuiz(quiz._id)}
                                            className="px-3 py-1 bg-purple-700 text-white rounded-full text-lg transition hover:bg-purple-900 animate-zoom-in w-fit"
                                        >
                                            Start Quiz
                                        </button>
                                </div>
                        </div>
                    ))}
                </div>

                {filteredQuizzes.length === 0 && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
                            <p className="text-gray-600">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* <div className="bg-black text-white py-16 mt-16">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-4">Ready to boost your placement chances?</h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Join thousands of students who have improved their skills and landed their dream jobs through our comprehensive quiz platform.
                    </p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                        View All Categories
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default QuizzesPage;