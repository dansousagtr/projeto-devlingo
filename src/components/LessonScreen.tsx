import React, { useState } from 'react'
import { X, Heart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Question } from '../types'

interface LessonScreenProps {
    lessonId?: string | number
    questions: Question[]
    onClose?: () => void
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
    questions,
    onClose,
}) => {
    const navigate = useNavigate()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [lives, setLives] = useState(3)
    const [correctAnswers, setCorrectAnswers] = useState(0)

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    const handleSelectOption = (index: number) => {
        setSelectedOption(index)
    }

    const handleVerify = () => {
        if (selectedOption === null) return

        if (selectedOption === currentQuestion.correctAnswer) {
            setCorrectAnswers(correctAnswers + 1)
            handleNext()
        } else {
            if (lives > 1) {
                setLives(lives - 1)
                setSelectedOption(null)
            } else {
                setLives(0)
                // Fim do jogo - perder todas as vidas
                setTimeout(() => {
                    navigate({ to: '/' })
                }, 1500)
            }
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedOption(null)
        } else {
            // Quiz completo - redirecionar
            navigate({ to: '/' })
        }
    }

    const handleSkip = () => {
        handleNext()
    }

    const handleClose = () => {
        onClose?.()
        navigate({ to: '/' })
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-4 p-6 border-b border-gray-100">
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    aria-label="Fechar lição"
                >
                    <X size={28} />
                </button>

                {/* Progress Bar */}
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Lives */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Heart size={24} className="fill-red-500 text-red-500" />
                    <span className="text-rose-500 font-bold text-lg">{lives}</span>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12">
                {/* Question Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    {currentQuestion.title}
                </h2>

                {/* Options Grid */}
                <div className="space-y-4 flex-1">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectOption(index)}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${selectedOption === index
                                    ? 'bg-blue-100 border-blue-400'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span
                                className={`text-left font-medium ${selectedOption === index
                                        ? 'text-blue-900'
                                        : 'text-gray-800'
                                    }`}
                            >
                                {option}
                            </span>

                            {/* Badge */}
                            <div
                                className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold ml-3 ${selectedOption === index
                                        ? 'bg-blue-400 border-blue-500 text-white'
                                        : 'border-gray-300 text-gray-600'
                                    }`}
                            >
                                {index + 1}
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 p-6">
                <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
                    <button
                        onClick={handleSkip}
                        className="bg-gray-200 text-gray-700 font-bold uppercase px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors text-sm"
                    >
                        Pular
                    </button>

                    <button
                        onClick={handleVerify}
                        disabled={selectedOption === null}
                        className={`font-bold uppercase px-8 py-3 rounded-xl transition-colors text-sm ${selectedOption !== null
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-green-300 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Verificar
                    </button>
                </div>
            </footer>
        </div>
    )
}

export default LessonScreen
