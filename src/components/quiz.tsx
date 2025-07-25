"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, LoaderCircle, ArrowRight, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle}
from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle
};

const questions = [
  {
    id: 'q1',
    text: 'What excites you the most?',
    options: [
      { id: 'a1', text: 'Exploring new worlds', icon: 'Orbit' },
      { id: 'a2', text: 'Solving puzzles', icon: 'Puzzle' },
      { id: 'a3', text: 'Creating new things', icon: 'Sparkle' },
      { id: 'a4', text: 'Talking to people', icon: 'MessageSquare' },
      { id: 'a5', text: 'Cooking and experimenting', icon: 'UtensilsCrossed' },
    ],
  },
  {
    id: 'q2',
    text: 'Pick a dream activity:',
    options: [
      { id: 'a1', text: 'Fly a spaceship', icon: 'Rocket' },
      { id: 'a2', text: 'Build a robot', icon: 'Wrench' },
      { id: 'a3', text: 'Care for animals', icon: 'PawPrint' },
      { id: 'a4', text: 'Direct a movie', icon: 'Clapperboard' },
      { id: 'a5', text: 'Train like an athlete', icon: 'Dumbbell' },
    ],
  },
  {
    id: 'q3',
    text: 'You prefer to...',
    options: [
      { id: 'a1', text: 'Work alone', icon: 'User' },
      { id: 'a2', text: 'Work with people', icon: 'Users2' },
      { id: 'a3', text: 'Work with machines/tools', icon: 'Wrench' },
      { id: 'a4', text: 'Work with nature', icon: 'Leaf' },
    ],
  },
  {
    id: 'q4',
    text: 'Pick a superpower:',
    options: [
      { id: 'a1', text: 'Super-intelligence', icon: 'BrainCircuit' },
      { id: 'a2', text: 'Build anything', icon: 'Wrench' },
      { id: 'a3', text: 'Make people laugh', icon: 'MessageSquare' },
      { id: 'a4', text: 'Speak every language', icon: 'MessageSquare' }, // Using MessageSquare for language too
      { id: 'a5', text: 'Heal others', icon: 'HeartHandshake' },
    ],
  },
  {
    id: 'q5',
    text: 'If you could live in any time...',
    options: [
      { id: 'a1', text: 'The past', icon: 'Book' },
      { id: 'a2', text: 'The present', icon: 'Tent' },
      { id: 'a3', text: 'The future', icon: 'Rocket' },
    ],
  },
  {
    id: 'q6',
    text: 'Pick your favorite school subject:',
    options: [
      { id: 'a1', text: 'Science', icon: 'FlaskConical' },
      { id: 'a2', text: 'Art', icon: 'Palette' },
      { id: 'a3', text: 'Literature', icon: 'BookOpen' },
      { id: 'a4', text: 'Math', icon: 'Calculator' },
      { id: 'a5', text: 'Sports', icon: 'Dumbbell' },
    ],
  },
  {
    id: 'q7',
    text: 'Your ideal weekend involves:',
    options: [
      { id: 'a1', text: 'Adventure', icon: 'Mountain' },
      { id: 'a2', text: 'Music or videos', icon: 'Headset' },
      { id: 'a3', text: 'Puzzles or games', icon: 'Puzzle' },
      { id: 'a4', text: 'Nature walks', icon: 'Leaf' },
      { id: 'a5', text: 'Helping family or friends', icon: 'Handshake' },
    ],
  },
  {
    id: 'q8',
    text: 'How do you make decisions?',
    options: [
      { id: 'a1', text: 'I think deeply', icon: 'BrainCircuit' },
      { id: 'a2', text: 'I follow my heart', icon: 'Heart' },
      { id: 'a3', text: 'I weigh the pros & cons', icon: 'Scale' },
      { id: 'a4', text: 'I go with the flow', icon: 'Dice5' },
    ],
  },
  {
    id: 'q9',
    text: `When you grow up, you'd love to…`,
    options: [
      { id: 'a1', text: 'Explore space', icon: 'Orbit' },
      { id: 'a2', text: 'Invent new tech', icon: 'Wrench' },
      { id: 'a3', text: 'Inspire crowds', icon: 'Mic' },
      { id: 'a4', text: 'Open a cafe', icon: 'UtensilsCrossed' },
      { id: 'a5', text: 'Save the world', icon: 'Sword' },
    ],
  },
  {
    id: 'q10',
    text: 'Pick one word that describes you:',
    options: [
      { id: 'a1', text: 'Curious', icon: 'Sparkles' },
      { id: 'a2', text: 'Brave', icon: 'Shield' },
      { id: 'a3', text: 'Creative', icon: 'Palette' },
      { id: 'a4', text: 'Calm', icon: 'TreePine' },
      { id: 'a5', text: 'Fun', icon: 'MessageSquare' }, // Using MessageSquare for fun too
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
