
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight, ArrowLeft, LoaderCircle } from 'lucide-react';

export const questions = [
    {
        id: 'q1',
        text: 'What activities do you enjoy the most in your free time?',
        options: ['Exploring new technologies or space', 'Creating art, music, or stories', 'Solving puzzles or complex problems', 'Helping others or the environment'],
    },
    {
        id: 'q2',
        text: 'If you could learn one new skill, what would it be?',
        options: ['Coding or data analysis', 'A musical instrument or artistic technique', 'A new language or a complex theory', 'Public speaking or first aid'],
    },
    {
        id: 'q3',
        text: 'What do you think you are really good at?',
        options: ['Analyzing complex situations', 'Coming up with new ideas', 'Organizing and planning', 'Understanding and connecting with people'],
    },
    {
        id: 'q4',
        text: 'How do you handle failure or mistakes?',
        options: ['Analyze what went wrong and learn from it.', 'Try again immediately with a different approach.', 'Take a break to reflect before trying again.', 'Seek advice from others.'],
    },
    {
        id: 'q5',
        text: 'Are you more creative or logical in your thinking?',
        options: ['Mostly logical', 'Mostly creative', 'A balance of both', 'It depends on the situation'],
    },
    {
        id: 'q6',
        text: 'When solving a problem, do you prefer experiments, discussions, or reading?',
        options: ['Hands-on experiments', 'Collaborative discussions', 'In-depth reading and research', 'A mix of all three'],
    },
    {
        id: 'q7',
        text: 'What kind of impact do you want to make in the world?',
        options: ['Create something innovative that changes an industry.', 'Inspire people through art or ideas.', 'Help solve a major social or environmental problem.', 'Make a positive difference in my local community.'],
    },
    {
        id: 'q8',
        text: 'If you could invent something, what would it be?',
        options: ['A tool to solve a major environmental problem.', 'A new form of art or entertainment.', 'A technology that advances human knowledge.', 'A service that helps people in need.'],
    },
    {
        id: 'q9',
        text: 'Do you see yourself working in an office, lab, outdoors, or from home?',
        options: ['A modern office or co-working space.', 'A scientific lab or workshop.', 'Outdoors in nature.', 'From home with a flexible schedule.'],
    },
    {
        id: 'q10',
        text: 'Would you rather have a high-paying job or one that makes you happy?',
        options: ['A high-paying job, even if it\'s not my passion.', 'A job I love, even if the pay is lower.', 'I want to find a job that is both high-paying and fulfilling.', 'I\'m not sure what would make me happiest yet.'],
    },
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

  const handleAnswerChange = (questionId: string, answerText: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerText }));
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                {currentQuestion.options.map((option) => (
                    <Button
                        key={option}
                        variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                        className="h-auto py-3 text-wrap"
                        onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    >
                        {option}
                    </Button>
                ))}
            </div>
          <div className="flex justify-between w-full max-w-lg mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2" /> Back
            </Button>
            
            {isLastQuestion ? (
              <Button size="lg" onClick={() => onSubmit(answers)} disabled={isLoading || !answers[currentQuestion.id]}>
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
              <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>
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
