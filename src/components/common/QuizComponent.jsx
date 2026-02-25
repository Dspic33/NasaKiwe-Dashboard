import React, { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, HelpCircle } from 'lucide-react'
import './Quiz.css'

const QuizComponent = ({ quizData }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null)
    const [isAnswered, setIsAnswered] = useState(false)

    const handleOptionClick = (index) => {
        if (isAnswered) return
        setSelectedOption(index)
        setIsAnswered(true)
        if (index === quizData.questions[currentQuestion].correct) {
            setScore(score + 1)
        }
    }

    const handleNext = () => {
        const nextQuestion = currentQuestion + 1
        if (nextQuestion < quizData.questions.length) {
            setCurrentQuestion(nextQuestion)
            setSelectedOption(null)
            setIsAnswered(false)
        } else {
            setShowResult(true)
        }
    }

    const resetQuiz = () => {
        setCurrentQuestion(0)
        setScore(0)
        setShowResult(false)
        setSelectedOption(null)
        setIsAnswered(false)
    }

    const getPerformanceMessage = () => {
        const percentage = (score / quizData.questions.length) * 100
        if (percentage === 100) return '¡Excelente! Conoces perfectamente tus funciones.'
        if (percentage >= 70) return '¡Muy bien! Tienes un buen dominio de tus responsabilidades.'
        return 'Buen intento. Te recomendamos repasar los ejes de funciones.'
    }

    if (showResult) {
        return (
            <div className="quiz-result institutional-card">
                <Trophy size={64} className="result-icon pulse" />
                <h2>{quizData.title}</h2>
                <div className="score-display">
                    <span className="score-number">{score}</span>
                    <span className="score-total">/ {quizData.questions.length}</span>
                </div>
                <p className="result-message">{getPerformanceMessage()}</p>
                <div className="qualification-badge">
                    Calificación: <strong>{((score / quizData.questions.length) * 10).toFixed(1)}</strong>
                </div>
                <button className="reset-btn" onClick={resetQuiz}>
                    <RotateCcw size={18} />
                    Reiniciar Test
                </button>
            </div>
        )
    }

    const q = quizData.questions[currentQuestion]

    return (
        <div className="quiz-container institutional-card">
            <div className="quiz-header">
                <div className="quiz-progress">
                    Pregunta {currentQuestion + 1} de {quizData.questions.length}
                </div>
                <h3>{quizData.title}</h3>
            </div>

            <div className="question-section">
                <h4 className="question-text">{q.question}</h4>
                <div className="options-grid">
                    {q.options.map((option, index) => {
                        let statusClass = ''
                        if (isAnswered) {
                            if (index === q.correct) statusClass = 'correct'
                            else if (index === selectedOption) statusClass = 'wrong'
                        }

                        return (
                            <button
                                key={index}
                                className={`option-btn ${selectedOption === index ? 'selected' : ''} ${statusClass}`}
                                onClick={() => handleOptionClick(index)}
                                disabled={isAnswered}
                            >
                                <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                                <div className="option-content">{option}</div>
                                {isAnswered && index === q.correct && <CheckCircle size={18} className="status-icon" />}
                                {isAnswered && index === selectedOption && index !== q.correct && <XCircle size={18} className="status-icon" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {isAnswered && (
                <div className={`feedback-section ${selectedOption === q.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
                    <HelpCircle size={20} />
                    <p>{q.explanation}</p>
                </div>
            )}

            {isAnswered && (
                <button className="next-btn" onClick={handleNext}>
                    {currentQuestion + 1 === quizData.questions.length ? 'Finalizar' : 'Siguiente'}
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
    )
}

export default QuizComponent
