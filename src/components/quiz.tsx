"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, LoaderCircle, ArrowRight } from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star
};

const questions = [
  {
    id: 'q1',
    text: 'When you imagine your ideal future, what environment are you in?',
    options: [
      { id: 'a1', text: 'Innovative Lab', icon: 'Cpu' },
      { id: 'a2', text: 'Quiet Nature', icon: 'TreePine' },
      { id: 'a3', text: 'Bustling City', icon: 'Building2' },
      { id: 'a4', text: 'Creative Studio', icon: 'Paintbrush' },
    ],
  },
  {
    id: 'q2',
    text: 'Which of these values is most important to you?',
    options: [
      { id: 'a1', text: 'Knowledge', icon: 'BookOpen' },
      { id: 'a2', text: 'Community', icon: 'Users' },
      { id: 'a3', text: 'Creativity', icon: 'Lightbulb' },
      { id: 'a4', text: 'Impact', icon: 'TrendingUp' },
    ],
  },
  {
    id: 'q3',
    text: 'What kind of problems are you most passionate about solving?',
    options: [
      { id: 'a1', text: 'Technological', icon: 'Code' },
      { id: 'a2', text: 'Social', icon: 'HeartHandshake' },
      { id: 'a3', text: 'Environmental', icon: 'Leaf' },
      { id: 'a4', text: 'Artistic', icon: 'Music' },
    ],
  },
  {
    id: 'q4',
    text: 'How do you prefer to learn and grow?',
    options: [
      { id: 'a1', text: 'Hands-on', icon: 'Wrench' },
      { id: 'a2', text: 'Theoretically', icon: 'BrainCircuit' },
      { id: 'a3', text: 'Collaboratively', icon: 'MessageSquare' },
      { id: 'a4', text: 'Independently', icon: 'User' },
    ],
  },
  {
    id: 'q5',
    text: 'What is your ultimate ambition?',
    options: [
      { id: 'a1', text: 'To be a Leader', icon: 'Crown' },
      { id: 'a2', text: 'To be an Innovator', icon: 'Rocket' },
      { id: 'a3', text: 'To be a Helper', icon: 'Shield' },
      { id: 'a4', text: 'To be a Creator', icon: 'Star' },
    ],
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
    // Update progress as soon as the question index changes
    const progress = (currentQuestionIndex / questions.length) * 100 * 0.5;
    onProgressUpdate(progress);
  }, [currentQuestionIndex, onProgressUpdate]);


  const handleAnswerSelect = (questionId: string, answerText: string) => {
    const newAnswers = { ...answers, [questionId]: answerText };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 300);
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">{currentQuestion.text}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
              const Icon = icons[option.icon];
              const isSelected = answers[currentQuestion.id] === option.text;
              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.text)}
                    className={`flex flex-col items-center justify-center p-4 sm:p-6 text-center border-2 rounded-lg transition-all duration-200 w-full h-full
                      ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent/20 hover:border-accent'}`}
                  >
                    <Icon className={`h-8 w-8 mb-2 transition-colors ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span className="font-medium text-sm sm:text-base">{option.text}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
          {isLastQuestion && allQuestionsAnswered && (
            <div className="mt-8 text-center">
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
            </div>
          )}
        </CardContent>
      </motion.div>
    </AnimatePresence>
  );
};

export default Quiz;
