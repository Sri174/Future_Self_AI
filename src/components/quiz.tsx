"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, LoaderCircle, ArrowRight, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle, Megaphone, Group, Trophy, DollarSign, PenTool, Video, Search}
from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle, Megaphone, Group, Trophy, DollarSign, PenTool, Video, Search
};

const questions = [
  {
    id: 'q1',
    text: 'Which of the following activities do you enjoy the most?',
    options: [
      { id: 'a1', text: 'Doing science experiments', icon: 'FlaskConical' },
      { id: 'a2', text: 'Drawing or painting', icon: 'Paintbrush' },
      { id: 'a3', text: 'Solving puzzles or coding', icon: 'Puzzle' },
      { id: 'a4', text: 'Speaking in front of others', icon: 'Megaphone' },
      { id: 'a5', text: 'Reading and researching', icon: 'BookOpen' },
      { id: 'a6', text: 'Building or fixing things', icon: 'Wrench' },
    ],
  },
  {
    id: 'q2',
    text: 'What kind of project would excite you the most?',
    options: [
      { id: 'a1', text: 'Creating a robot', icon: 'Cpu' },
      { id: 'a2', text: 'Designing an art exhibition', icon: 'Palette' },
      { id: 'a3', text: 'Writing a research paper', icon: 'PenTool' },
      { id: 'a4', text: 'Organizing a community event', icon: 'Group' },
      { id: 'a5', text: 'Developing an app', icon: 'Code' },
      { id: 'a6', text: 'Starting a YouTube channel', icon: 'Video' },
    ],
  },
  {
    id: 'q3',
    text: 'How do you handle failure or mistakes?',
    options: [
      { id: 'a1', text: 'See them as a chance to learn', icon: 'Lightbulb' },
      { id: 'a2', text: 'Feel discouraged', icon: 'TrendingUp' }, //trending down is not available
      { id: 'a3', text: 'Understand and fix it', icon: 'Wrench' },
      { id: 'a4', text: 'Blame others', icon: 'Users' },
    ],
  },
  {
    id: 'q4',
    text: 'In a group project, what role do you naturally take?',
    options: [
      { id: 'a1', text: 'Idea Generator', icon: 'Lightbulb' },
      { id: 'a2', text: 'Planner & Organizer', icon: 'Book' },
      { id: 'a3', text: 'Team Motivator', icon: 'HeartHandshake' },
      { id: 'a4', text: 'Designer/Creative', icon: 'Palette' },
      { id: 'a5', text: 'Researcher/Data Analyst', icon: 'Search' },
      { id: 'a6', text: 'Hands-on Executor', icon: 'Wrench' },
    ],
  },
  {
    id: 'q5',
    text: 'If your friend is feeling sad or anxious, what would you do?',
    options: [
      { id: 'a1', text: 'Give advice or solutions', icon: 'BrainCircuit' },
      { id: 'a2', text: 'Stay with them and listen', icon: 'Headset' },
      { id: 'a3', text: 'Try to cheer them up', icon: 'Sparkles' },
      { id: 'a4', text: 'Leave them alone', icon: 'User' },
      { id: 'a5', text: 'Talk to an adult for help', icon: 'MessageSquare' },
    ],
  },
  {
    id: 'q6',
    text: 'When faced with a new or difficult challenge, how do you feel?',
    options: [
      { id: 'a1', text: 'Excited and ready to explore', icon: 'Rocket' },
      { id: 'a2', text: 'Curious but slightly nervous', icon: 'Brain' },
      { id: 'a3', text: 'Stressed and hesitant', icon: 'Shield' }, // as in defensive
      { id: 'a4', text: 'Confident and determined', icon: 'Crown' },
      { id: 'a5', text: 'Prefer to avoid it', icon: 'Shield' },
    ],
  },
  {
    id: 'q7',
    text: 'What motivates you to work hard or do well? (Choose one)',
    options: [
      { id: 'a1', text: 'Recognition or praise', icon: 'Trophy' },
      { id: 'a2', text: 'Personal growth', icon: 'TrendingUp' },
      { id: 'a3', text: 'Earning potential', icon: 'DollarSign' },
      { id: 'a4', text: 'Helping others', icon: 'HeartHandshake' },
      { id: 'a5', text: 'Achieving a big idea', icon: 'Lightbulb' },
      { id: 'a6', text: 'Solving complex problems', icon: 'Puzzle' },
    ],
  },
  {
    id: 'q8',
    text: 'What kind of future do you imagine for yourself?',
    options: [
      { id: 'a1', text: 'Scientist, Engineer, Doctor', icon: 'FlaskConical' },
      { id: 'a2', text: 'Designer, Artist, Animator', icon: 'Palette' },
      { id: 'a3', text: 'Teacher, Coach, Counselor', icon: 'BookOpen' },
      { id: 'a4', text: 'Entrepreneur, Leader, Influencer', icon: 'Megaphone' },
      { id: 'a5', text: 'Software Developer, AI Engineer', icon: 'Code' },
      { id: 'a6', text: 'Environmentalist, Researcher', icon: 'Leaf' },
    ],
  },
  {
    id: 'q9',
    text: 'When learning something new, which method do you prefer?',
    options: [
      { id: 'a1', text: 'Watching videos or animations', icon: 'Video' },
      { id: 'a2', text: 'Reading step-by-step guides', icon: 'Book' },
      { id: 'a3', text: 'Doing it myself hands-on', icon: 'Wrench' },
      { id: 'a4', text: 'Explaining it to others', icon: 'MessageSquare' },
      { id: 'a5', text: 'Visual mind-mapping', icon: 'BrainCircuit' },
    ],
  },
  {
    id: 'q10',
    text: 'How do you usually make decisions?',
    options: [
      { id: 'a1', text: 'Based on facts and data', icon: 'Calculator' },
      { id: 'a2', text: 'Based on how I feel', icon: 'Heart' },
      { id: 'a3', text: 'By asking others', icon: 'Users' },
      { id: 'a4', text: 'After thinking of long-term effects', icon: 'Orbit' },
      { id: 'a5', text: 'On the spot without much thinking', icon: 'Dice5' },
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
