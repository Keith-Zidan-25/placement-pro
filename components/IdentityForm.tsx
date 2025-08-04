"use client";

import { ChangeEventHandler, useState } from "react";

interface UserData {
    username: string;
    numberId: string | number;
}

interface FormProps {
    userInput: UserData
    hideForm: (value: boolean) => void
    storeFormValues: (value: UserData) => void
}

interface CustomError {
    [key: string]: string;
}

export default function QuizIdenticationForm({ userInput, hideForm, storeFormValues }: FormProps) {
    const [termsAgreed, setTermsAgreed] = useState<boolean>(false);

    const [errors, setErrors] = useState<CustomError>({})
    
    const handleNameInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        const name = e.target.value;
        storeFormValues({
            username: name,
            numberId: userInput.numberId
        })
    }

    const handleRollNoInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        const numberId = e.target.value;
        storeFormValues({
            username: userInput.username,
            numberId: numberId
        })
    }

    const handleSubmit = () => {
        console.log(userInput);

        if (!termsAgreed) {
            alert("Please agree to the Terms & Conditions");
            return;
        }

        if (!userInput.numberId || !userInput.username) {
            alert('Please fill in all the details');
            return;
        }

        storeFormValues(userInput);
        hideForm(true);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">User Identification</h3>
                    <p className="text-purple-100 text-sm">
                        Please fill in these details to access the quiz
                    </p>
                </div>

                <div className="p-6">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <input 
                                    onChange={handleNameInput}
                                    type="text" 
                                    placeholder="Enter your full name"
                                    className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none placeholder-gray-400"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Roll Number / Student ID *
                            </label>
                            <div className="relative">
                                <input
                                    onChange={handleRollNoInput} 
                                    type="text" 
                                    placeholder="Enter your roll number"
                                    className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none placeholder-gray-400"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                onChange={() => {setTermsAgreed(true)}}
                                type="checkbox" 
                                id="terms"
                                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the quiz terms and conditions and confirm that the information provided is accurate.
                            </label>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                type="submit"
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Start Quiz
                            </button>
                        </div>
                    </form>
                </div>

                <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-300 rounded-full opacity-40"></div>
            </div>
        </div>
    );
}