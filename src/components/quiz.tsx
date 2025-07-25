"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, LoaderCircle, ArrowRight, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle, Megaphone, Group, Trophy, DollarSign, PenTool, Video, Search, Repeat, Briefcase, Globe}
from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  Cpu, TreePine, Building2, Paintbrush, BookOpen, Users, Lightbulb, TrendingUp, Code, HeartHandshake, Leaf, Music, Wrench, BrainCircuit, MessageSquare, User, Crown, Rocket, Shield, Star, Sparkles, FlaskConical, PawPrint, Clapperboard, Dumbbell, GraduationCap, Palette, Book, Calculator, Users2, Tent, Headset, Puzzle, Mountain, Handshake, Brain, Heart, Scale, Dice5, Orbit, LightbulbIcon, Mic, UtensilsCrossed, Sword, Sparkle, Megaphone, Group, Trophy, DollarSign, PenTool, Video, Search, Repeat, Briefcase, Globe
};

const questions = [
  {
    id: 'q1',
    text: 'What excites you the most?',
    options: [
      { id: 'a1', text: 'Exploring new technologies or space', icon: 'Rocket' },
      { id: 'a2', text: 'Creating art, music, or stories', icon: 'Paintbrush' },
      { id: 'a3', text: 'Solving puzzles or complex problems', icon: 'Puzzle' },
      { id: 'a4', text: 'Helping others (people, animals, environment)', icon: 'HeartHandshake' },
    ],
  },
  {
    id: 'q2',
    text: 'Your ideal weekend involves:',
    options: [
      { id: 'a1', text: 'Reading/learning something new', icon: 'BookOpen' },
      { id: 'a2', text: 'Gaming or building digital projects', icon: 'Cpu' },
      { id: 'a3', text: 'Outdoor adventures or sports', icon: 'Mountain' },
      { id: 'a4', text: 'Socializing with friends', icon: 'Users' },
    ],
  },
  {
    id: 'q3',
    text: 'Choose a superpower:',
    options: [
      { id: 'a1', text: 'Super intelligence (solve any problem)', icon: 'BrainCircuit' },
      { id: 'a2', text: 'Creativity (invent anything imaginable)', icon: 'Sparkles' },
      { id: 'a3', text: 'Leadership (inspire and guide others)', icon: 'Megaphone' },
      { id: 'a4', text: 'Empathy (understand everyone’s feelings)', icon: 'Heart' },
    ],
  },
  {
    id: 'q4',
    text: 'In a group project, you’re most likely to:',
    options: [
      { id: 'a1', text: 'Lead and delegate tasks', icon: 'Crown' },
      { id: 'a2', text: 'Brainstorm innovative ideas', icon: 'Lightbulb' },
      { id: 'a3', text: 'Organize and structure the work', icon: 'Book' },
      { id: 'a4', text: 'Support others quietly', icon: 'Handshake' },
    ],
  },
  {
    id: 'q5',
    text: 'When faced with failure, you:',
    options: [
      { id: 'a1', text: 'Try again immediately', icon: 'Repeat' },
      { id: 'a2', text: 'Analyze what went wrong', icon: 'Search' },
      { id: 'a3', text: 'Take a break and reflect', icon: 'Brain' },
      { id: 'a4', text: 'Ask for help', icon: 'MessageSquare' },
    ],
  },
  {
    id: 'q6',
    text: 'Your strength is:',
    options: [
      { id: 'a1', text: 'Logical problem-solving', icon: 'Puzzle' },
      { id: 'a2', text: 'Emotional intelligence', icon: 'Heart' },
      { id: 'a3', text: 'Risk-taking and adaptability', icon: 'Rocket' },
      { id: 'a4', text: 'Attention to detail', icon: 'PenTool' },
    ],
  },
  {
    id: 'q7',
    text: 'You believe talent is:',
    options: [
      { id: 'a1', text: 'Something you can develop (growth mindset)', icon: 'TrendingUp' },
      { id: 'a2', text: 'Mostly innate (fixed mindset)', icon: 'Shield' },
    ],
  },
  {
    id: 'q8',
    text: 'When something is challenging, you feel:',
    options: [
      { id: 'a1', text: 'Motivated to learn', icon: 'Star' },
      { id: 'a2', text: 'Frustrated but persistent', icon: 'TrendingUp' }, //trending down not available
      { id: 'a3', text: 'Overwhelmed and avoid it', icon: 'Shield' },
    ],
  },
  {
    id: 'q9',
    text: 'Feedback helps you:',
    options: [
      { id: 'a1', text: 'Improve and grow', icon: 'Rocket' },
      { id: 'a2', text: 'Defend your approach', icon: 'Shield' },
      { id: 'a3', text: 'Feel discouraged', icon: 'TrendingUp' }, //trending down not available
    ],
  },
  {
    id: 'q10',
    text: 'Your dream work environment:',
    options: [
      { id: 'a1', text: 'Remote (anywhere in the world)', icon: 'Globe' },
      { id: 'a2', text: 'High-tech office/lab', icon: 'Building2' },
      { id: 'a3', text: 'Creative/artistic studio', icon: 'Paintbrush' },
      { id: 'a4', text: 'Fast-paced startup', icon: 'Rocket' },
    ],
  },
  {
    id: 'q11',
    text: 'You’d rather:',
    options: [
      { id: 'a1', text: 'Build systems (tech, engineering)', icon: 'Wrench' },
      { id: 'a2', text: 'Express ideas (art, writing, design)', icon: 'PenTool' },
      { id: 'a3', text: 'Lead teams (business, politics)', icon: 'Briefcase' },
      { id: 'a4', text: 'Discover new knowledge (science, research)', icon: 'FlaskConical' },
    ],
  },
  {
    id: 'q12',
    text: 'Salary vs. Passion:',
    options: [
      { id: 'a1', text: 'High salary (even if work is boring)', icon: 'DollarSign' },
      { id: 'a2', text: 'Passionate work (even if lower pay)', icon: 'Heart' },
      { id: 'a3', text: 'Balance of both', icon: 'Scale' },
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
