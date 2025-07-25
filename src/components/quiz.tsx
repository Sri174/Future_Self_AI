
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { List, Orbit, BrainCircuit, Wrench, Puzzle, Lightbulb, BookOpen, FlaskConical, Brain, Sparkles, TrendingDown, RefreshCw, MessageSquare, Shield, User, Star, Repeat, Search, ArrowRight, Handshake, PenTool, Globe, Building2, Paintbrush, Rocket, Briefcase, Heart, Scale, DollarSign, LoaderCircle }
from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  List, Orbit, BrainCircuit, Wrench, Puzzle, Lightbulb, BookOpen, FlaskConical, Brain, Sparkles, TrendingDown, RefreshCw, MessageSquare, Shield, User, Star, Repeat, Search, ArrowRight, Handshake, PenTool, Globe, Building2, Paintbrush, Rocket, Briefcase, Heart, Scale, DollarSign, LoaderCircle
};

export const questions = [
  {
    id: 'q1',
    text: 'When learning something new, you prefer:',
    options: [
      { id: 'a1', text: 'Structured, step-by-step instructions', icon: 'List' },
      { id: 'a2', text: 'Exploring freely and making connections', icon: 'Orbit' },
      { id: 'a3', text: 'Deep analysis before trying', icon: 'BrainCircuit' },
      { id: 'a4', text: 'Immediate hands-on practice', icon: 'Wrench' },
    ],
  },
  {
    id: 'q2',
    text: 'Your problem-solving style is:',
    options: [
      { id: 'a1', text: 'Logical and systematic', icon: 'Puzzle' },
      { id: 'a2', text: 'Intuitive and creative', icon: 'Lightbulb' },
      { id: 'a3', text: 'Research-driven and detail-oriented', icon: 'BookOpen' },
      { id: 'a4', text: 'Trial-and-error experimentation', icon: 'FlaskConical' },
    ],
  },
  {
    id: 'q3',
    text: 'Under pressure, your mind:',
    options: [
      { id: 'a1', text: 'Stays calm and focused', icon: 'Brain' },
      { id: 'a2', text: 'Generates rapid, impulsive ideas', icon: 'Sparkles' },
      { id: 'a3', text: 'Overanalyzes and hesitates', icon: 'TrendingDown' },
      { id: 'a4', text: 'Shifts between ideas quickly', icon: 'RefreshCw' },
    ],
  },
  {
    id: 'q4',
    text: 'When someone disagrees with you, you:',
    options: [
      { id: 'a1', text: 'Listen and seek common ground', icon: 'Handshake' },
      { id: 'a2', text: 'Feel frustrated but try to explain', icon: 'MessageSquare' },
      { id: 'a3', text: 'Avoid conflict and retreat', icon: 'Shield' },
      { id: 'a4', text: 'Defend your view passionately', icon: 'Sparkles' },
    ],
  },
  {
    id: 'q5',
    text: 'Your reaction to criticism is:',
    options: [
      { id: 'a1', text: 'Reflect and improve', icon: 'Brain' },
      { id: 'a2', text: 'Dismiss it if it feels unfair', icon: 'Shield' },
      { id: 'a3', text: 'Take it personally', icon: 'Heart' },
      { id: 'a4', text: 'Analyze its validity objectively', icon: 'Scale' },
    ],
  },
  {
    id: 'q6',
    text: 'In team conflicts, you usually:',
    options: [
      { id: 'a1', text: 'Mediate and resolve tensions', icon: 'Handshake' },
      { id: 'a2', text: 'Focus on goals over feelings', icon: 'Briefcase' },
      { id: 'a3', text: 'Withdraw to avoid drama', icon: 'User' },
      { id: 'a4', text: 'Advocate for your perspective', icon: 'MessageSquare' },
    ],
  },
  {
    id: 'q7',
    text: 'Your energy comes from:',
    options: [
      { id: 'a1', text: 'Alone time (recharges you)', icon: 'Brain' },
      { id: 'a2', text: 'Social interactions (fuels you)', icon: 'User' },
      { id: 'a3', text: 'Achieving goals (motivates you)', icon: 'Star' },
      { id: 'a4', text: 'Creative expression (inspires you)', icon: 'Paintbrush' },
    ],
  },
  {
    id: 'q8',
    text: 'When plans change suddenly, you:',
    options: [
      { id: 'a1', text: 'Adapt easily', icon: 'RefreshCw' },
      { id: 'a2', text: 'Feel annoyed but adjust', icon: 'TrendingDown' },
      { id: 'a3', text: 'Overthink the implications', icon: 'BrainCircuit' },
      { id: 'a4', text: 'Struggle to pivot', icon: 'Shield' },
    ],
  },
  {
    id: 'q9',
    text: 'Your default communication style:',
    options: [
      { id: 'a1', text: 'Precise and factual', icon: 'PenTool' },
      { id: 'a2', text: 'Storytelling and metaphors', icon: 'BookOpen' },
      { id: 'a3', text: 'Diplomatic and empathetic', icon: 'Handshake' },
      { id: 'a4', text: 'Direct and concise', icon: 'MessageSquare' },
    ],
  },
  {
    id: 'q10',
    text: 'Under stress, you tend to:',
    options: [
      { id: 'a1', text: 'Breathe and refocus', icon: 'Brain' },
      { id: 'a2', text: 'Work harder to distract yourself', icon: 'Wrench' },
      { id: 'a3', text: 'Shut down and procrastinate', icon: 'Shield' },
      { id: 'a4', text: 'Seek novel solutions', icon: 'Lightbulb' },
    ],
  },
  {
    id: 'q11',
    text: 'Your biggest motivator is:',
    options: [
      { id: 'a1', text: 'Achievement and recognition', icon: 'Star' },
      { id: 'a2', text: 'Passion for the work itself', icon: 'Heart' },
      { id: 'a3', text: 'Impact on others/society', icon: 'Globe' },
      { id: 'a4', text: 'Financial security', icon: 'DollarSign' },
    ],
  },
  {
    id: 'q12',
    text: 'Failure feels like:',
    options: [
      { id: 'a1', text: 'A learning opportunity', icon: 'BookOpen' },
      { id: 'a2', text: 'A setback to overcome', icon: 'Repeat' },
      { id: 'a3', text: 'A personal flaw', icon: 'Shield' },
      { id: 'a4', text: 'A temporary obstacle', icon: 'Wrench' },
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

    