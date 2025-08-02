"use client"

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Download, AlertCircle, CheckCircle, Plus, Eye } from 'lucide-react';
import { Quiz } from '../../../utilities/typeDefinitions';
import { useSendRequest } from '../../../utilities/axiosInstance';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface FormData extends Quiz {
    image?: File;
}

interface ValidationErrors {
    [key: string]: string;
}

interface Question {
    question?: string;
    Question?: string;
    optionA?: string;
    'Option A'?: string;
    optionB?: string;
    'Option B'?: string;
    optionC?: string;
    'Option C'?: string;
    optionD?: string;
    'Option D'?: string;
    answer?: string;
    Answer?: string;
}

const QuizCreationPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        timelimit: 30,
        questionCount: 20,
        score: 100,
        imagePath: '',
        difficulty: 1,
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string>('');
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const {sendRequest} = useSendRequest();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const difficultyOptions = [
        { value: 1, label: 'Beginner', color: 'text-green-600' },
        { value: 2, label: 'Intermediate', color: 'text-yellow-600' },
        { value: 3, label: 'Advanced', color: 'text-red-600' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'timelimit' || name === 'questionCount' || name === 'score' || name === 'difficulty' 
                ? parseInt(value) || 0 
                : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePath: file.name
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    image: 'Please select a valid image file'
                }));
            }
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.timelimit <= 0) {
            newErrors.timelimit = 'Time limit must be greater than 0';
        }

        if (formData.questionCount <= 0) {
            newErrors.questionCount = 'Question count must be greater than 0';
        }

        if (formData.score <= 0) {
            newErrors.score = 'Score must be greater than 0';
        }

        if (questions.length === 0) {
            newErrors.questions = 'Please upload questions file';
        } else if (questions.length !== formData.questionCount) {
            newErrors.questions = `Number of questions (${questions.length}) doesn't match the specified count (${formData.questionCount})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const parseCSV = (file: File): Promise<Question[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse<Question>(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: ';',
                complete: (results) => {
                    try {
                        const parsedQuestions: Question[] = results.data.map((row, index: number) => {
                            const question: Question = {
                                question: row.question?.trim() || '',
                                optionA: row.optionA?.trim() || row['Option A']?.trim() || '',
                                optionB: row.optionB?.trim() || row['Option B']?.trim() || '',
                                optionC: row.optionC?.trim() || row['Option C']?.trim() || '',
                                optionD: row.optionD?.trim() || row['Option D']?.trim() || '',
                                answer: row.answer?.trim() || row.Answer?.trim() || ''
                            };

                            if (!question.question || !question.optionA || !question.optionB || 
                                !question.optionC || !question.optionD || !question.answer) {
                                throw new Error(`Row ${index + 1}: Missing required fields`);
                            }

                            const validAnswers = ['A', 'B', 'C', 'D'];
                            if (!validAnswers.includes(question.answer.toUpperCase())) {
                                throw new Error(`Row ${index + 1}: Answer must be A, B, C, or D`);
                            }

                            question.answer = question.answer.toUpperCase();
                            return question;
                        });

                        resolve(parsedQuestions);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error) => {
                    reject(new Error(`CSV parsing error: ${error.message}`));
                }
            });
        });
    };

    const parseExcel = (file: File): Promise<Question[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json<Question>(worksheet);

                    const parsedQuestions: Question[] = jsonData.map((row, index: number) => {
                        const question: Question = {
                            question: row.question?.toString().trim() || row.Question?.toString().trim() || '',
                            optionA: row.optionA?.toString().trim() || row['Option A']?.toString().trim() || '',
                            optionB: row.optionB?.toString().trim() || row['Option B']?.toString().trim() || '',
                            optionC: row.optionC?.toString().trim() || row['Option C']?.toString().trim() || '',
                            optionD: row.optionD?.toString().trim() || row['Option D']?.toString().trim() || '',
                            answer: row.answer?.toString().trim() || row.Answer?.toString().trim() || ''
                        };

                        if (!question.question || !question.optionA || !question.optionB || 
                            !question.optionC || !question.optionD || !question.answer) {
                            throw new Error(`Row ${index + 1}: Missing required fields`);
                        }

                        const validAnswers = ['A', 'B', 'C', 'D'];
                        if (!validAnswers.includes(question.answer.toUpperCase())) {
                            throw new Error(`Row ${index + 1}: Answer must be A, B, C, or D`);
                        }

                        question.answer = question.answer.toUpperCase();
                        return question;
                    });

                    resolve(parsedQuestions);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read Excel file'));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus('uploading');
        setUploadError('');

        try {
            let parsedQuestions: Question[];

            if (file.name.endsWith('.csv')) {
                parsedQuestions = await parseCSV(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                parsedQuestions = await parseExcel(file);
            } else {
                throw new Error('Please upload a CSV or Excel file');
            }

            setQuestions(parsedQuestions);
            setFormData(prev => ({
                ...prev,
                questionCount: parsedQuestions.length
            }));
            setUploadStatus('success');
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Failed to parse file');
            setUploadStatus('error');
            setQuestions([]);
        }
    };

    const downloadTemplate = (): void => {
        const templateData = [
            {
                question: 'What is the capital of France?',
                optionA: 'London',
                optionB: 'Berlin',
                optionC: 'Paris',
                optionD: 'Madrid',
                answer: 'C'
            },
            {
                question: 'Which programming language is known for web development?',
                optionA: 'Python',
                optionB: 'JavaScript',
                optionC: 'C++',
                optionD: 'Java',
                answer: 'B'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Questions');
        XLSX.writeFile(wb, 'quiz_template.xlsx');
    };

    const handleSubmit = async (): Promise<void> => {
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const quizData = {
                title: formData.title,
                description: formData.description,
                timelimit: formData.timelimit,
                questionCount: formData.questionCount,
                score: formData.score,
                imagePath: formData.imagePath,
                difficulty: formData.difficulty,
                questions: questions
            };

            console.log('Creating quiz:', quizData);

            const result = await sendRequest({
                config: {
                    method: 'POST',
                    url: '/api/quiz/upload',
                    data: quizData
                }
            });

            if (!result || !result.success) {
                alert('Failed to create quiz. Please try again.');
                return;
            }

            setFormData({
                title: '',
                description: '',
                timelimit: 30,
                questionCount: 20,
                score: 100,
                imagePath: '',
                difficulty: 1,
            });
            setQuestions([]);
            setUploadStatus('idle');
            
            alert('Quiz created successfully!');
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Failed to create quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
                    <p className="text-purple-200">
                        Design and upload questions for your placement assistance quiz
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quiz Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter quiz title"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter quiz description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time Limit (minutes) *
                                </label>
                                <input
                                    type="number"
                                    name="timelimit"
                                    value={formData.timelimit}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.timelimit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.timelimit && <p className="text-red-500 text-sm mt-1">{errors.timelimit}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Count *
                                </label>
                                <input
                                    type="number"
                                    name="questionCount"
                                    value={formData.questionCount}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.questionCount ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.questionCount && <p className="text-red-500 text-sm mt-1">{errors.questionCount}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Score *
                                </label>
                                <input
                                    type="number"
                                    name="score"
                                    value={formData.score}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.score ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.score && <p className="text-red-500 text-sm mt-1">{errors.score}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty Level *
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {difficultyOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Image</h2>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                ref={imageInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        
                            {formData.imagePath ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FileText className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-gray-600">{formData.imagePath}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setFormData(prev => ({ ...prev, imagePath: '', image: undefined }));
                                            if (imageInputRef.current) imageInputRef.current.value = '';
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Click to upload quiz image</p>
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Choose Image
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                            />

                            {uploadStatus === 'idle' && (
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Upload CSV or Excel file with questions
                                    </p>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Required columns: question, optionA, optionB, optionC, optionD, answer
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Choose File
                                    </button>
                                </div>
                            )}

                            {uploadStatus === 'uploading' && (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600">Processing file...</p>
                                </div>
                            )}

                            {uploadStatus === 'success' && (
                                <div className="text-center">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-green-600 mb-2">
                                        Successfully uploaded {questions.length} questions
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="flex items-center px-3 py-1 text-purple-600 hover:text-purple-700 border border-purple-600 rounded text-sm"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Preview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuestions([]);
                                                setUploadStatus('idle');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="flex items-center px-3 py-1 text-red-600 hover:text-red-700 border border-red-600 rounded text-sm"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="text-center">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-sm text-red-600 mb-2">{uploadError}</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setUploadStatus('idle');
                                        setUploadError('');
                                        }}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.questions && <p className="text-red-500 text-sm mt-2">{errors.questions}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        >
                        {isSubmitting ? (
                            <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Quiz...
                            </>
                        ) : (
                            <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Quiz
                            </>
                        )}
                        </button>
                    </div>
                </div>
            </div>

            {showPreview && (
                <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">Questions Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-6">
                                {questions.slice(0, 5).map((question, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                        {index + 1}. {question.question}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-black">
                                        <div>A. {question.optionA}</div>
                                        <div>B. {question.optionB}</div>
                                        <div>C. {question.optionC}</div>
                                        <div>D. {question.optionD}</div>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="font-medium text-green-600">Answer: {question.answer}</span>
                                    </div>
                                </div>
                                ))}
                                {questions.length > 5 && (
                                <p className="text-center text-gray-500 italic">
                                    ... and {questions.length - 5} more questions
                                </p>
                                )}
                            </div>
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

export default QuizCreationPage;