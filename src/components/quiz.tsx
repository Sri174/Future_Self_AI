
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight, ArrowLeft, LoaderCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';

export const questions = [
  { id: 'q1', text: 'What activities do you enjoy the most in your free time?' },
  { id: 'q2', text: 'If you could learn one new skill, what would it be?' },
  { id: 'q3', text: 'Which subject in school excites you the most, and why?' },
  { id: 'q4', text: 'Do you prefer working alone or in a team?' },
  { id: 'q5', text: 'What do you think you are really good at?' },
  { id: 'q6', text: 'What is something you find challenging but want to improve?' },
  { id: 'q7', text: 'How do you handle failure or mistakes?' },
  { id: 'q8', text: 'Are you more creative or logical in your thinking?' },
  { id: 'q9', text: 'Do you like following instructions or figuring things out on your own?' },
  { id: 'q10', text: 'When solving a problem, do you prefer experiments, discussions, or reading?' },
  { id: 'q11', text: 'Would you rather write an essay, give a presentation, or build a project?' },
  { id: 'q12', text: 'How do you react when someone disagrees with you?' },
  { id: 'q13', text: 'Do you like taking leadership roles in group activities?' },
  { id: 'q14', text: 'What kind of friends do you enjoy being around?' },
  { id: 'q15', text: 'How do you handle stress or pressure?' },
  { id: 'q16', text: 'What profession do you admire the most, and why?' },
  { id: 'q17', text: 'If you could invent something, what would it be?' },
  { id: 'q18', text: 'Do you see yourself working in an office, lab, outdoors, or from home?' },
  { id: 'q19', text: 'Would you prefer a job with stability or one with adventure and change?' },
  { id: 'q20', text: 'Do you enjoy working with computers, robots, or AI tools?' },
  { id: 'q21', text: 'Would you like to create apps, design games, or build machines?' },
  { id: 'q22', text: 'How comfortable are you with learning new technology?' },
  { id: 'q23', text: 'Is earning money, helping others, or creativity more important to you?' },
  { id: 'q24', text: 'What kind of impact do you want to make in the world?' },
  { id: 'q25', text: 'Would you rather have a high-paying job or one that makes you happy?' },
  { id: 'q26', text: 'How do you plan your day? Do you like schedules or flexibility?' },
  { id: 'q27', text: 'Do you finish tasks quickly or take your time to perfect them?' },
  { id: 'q28', text: 'Are you self-motivated, or do you need reminders?' },
  { id: 'q29', text: 'Where do you see yourself in 10 years?' },
  { id: 'q30', text: 'If you could live anywhere in the world, where would it be?' },
  { id: 'q31', text: 'What kind of person do you want to become?' },
];

interface QuizProps {
  onSubmit: (answers: Record<string, string>) => void;
  onProgressUpdate: (progress: number) => void;
  isLoading: boolean;
}

const Quiz: React.FC<QuizProps> = ({ onSubmit, onProgressUpdate, isLoading }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const progress = (currentQuestionIndex / questions.length) * 100 * 0.5;
    onProgressUpdate(progress);
  }, [currentQuestionIndex, onProgressUpdate]);

  const handleAnswerChange = (questionText: string, answerText: string) => {
    setAnswers(prev => ({ ...prev, [questionText]: answerText }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">{currentQuestion.text}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Textarea
            value={answers[currentQuestion.text] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.text, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full max-w-lg min-h-[100px] text-base"
          />
          <div className="flex justify-between w-full max-w-lg mt-6">
            <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2" /> Back
            </Button>
            
            {isLastQuestion ? (
              <Button size="lg" onClick={() => onSubmit(answers)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    See My Profile <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </motion.div>
    </AnimatePresence>
  );
};

export default Quiz;
