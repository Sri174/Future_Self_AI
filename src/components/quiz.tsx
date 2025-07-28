
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight, ArrowLeft, LoaderCircle, Sparkles } from 'lucide-react';

// Questions for younger students (5-10 years) - 10 questions total
export const questionsYoung = [
    {
        id: 'q1',
        text: 'What do you like to do most when you play?',
        options: ['Build things with blocks or toys', 'Draw, paint, or make crafts', 'Play games that make me think', 'Help my friends or family'],
    },
    {
        id: 'q2',
        text: 'What would you like to learn about?',
        options: ['How computers and robots work', 'How to make beautiful art', 'How animals and plants live', 'How to help people feel better'],
    },
    {
        id: 'q3',
        text: 'What are you really good at?',
        options: ['Figuring out how things work', 'Making up stories or drawing', 'Organizing my toys and room', 'Making friends and being kind'],
    },
    {
        id: 'q4',
        text: 'When something is hard to do, what do you do?',
        options: ['Try to understand why it\'s hard', 'Try a different way to do it', 'Take a break and try again later', 'Ask someone to help me'],
    },
    {
        id: 'q5',
        text: 'Do you like to make new things or solve puzzles?',
        options: ['I love solving puzzles', 'I love making new things', 'I like both the same', 'It depends on my mood'],
    },
    {
        id: 'q6',
        text: 'How do you like to learn new things?',
        options: ['By trying it myself', 'By talking with others', 'By reading or watching videos', 'All of these ways'],
    },
    {
        id: 'q7',
        text: 'What would make you really happy to do when you grow up?',
        options: ['Make cool inventions', 'Create beautiful things', 'Help save animals or the Earth', 'Help people in my neighborhood'],
    },
    {
        id: 'q8',
        text: 'If you could make something magical, what would it be?',
        options: ['Something to clean up the Earth', 'Something beautiful that makes people smile', 'Something that helps us learn new things', 'Something that helps people who are sad or hurt'],
    },
    {
        id: 'q9',
        text: 'What kind of place would you like to work in when you grow up?',
        options: ['A place with lots of computers and gadgets', 'A colorful place where I can be creative', 'Outside with animals and nature', 'A place where I can help people every day'],
    },
    {
        id: 'q10',
        text: 'What makes you feel most proud?',
        options: ['When I fix something that was broken', 'When I make something beautiful', 'When I learn something new and exciting', 'When I help someone who needs it'],
    },
];

// Questions for older students (11-17 years) - 10 questions total
export const questionsOlder = [
    {
        id: 'q1',
        text: 'What school subjects do you find most interesting?',
        options: ['Math, Science, and Technology', 'Art, Music, and Creative Writing', 'History, Literature, and Languages', 'Psychology, Social Studies, and Health'],
    },
    {
        id: 'q2',
        text: 'What activities do you enjoy most in your free time?',
        options: ['Coding, gaming, or exploring new tech', 'Drawing, music, writing, or crafting', 'Reading, researching, or learning new things', 'Volunteering, helping friends, or community activities'],
    },
    {
        id: 'q3',
        text: 'What do your friends and family say you are really good at?',
        options: ['Solving technical problems and understanding how things work', 'Being creative and coming up with original ideas', 'Explaining things clearly and organizing information', 'Understanding people\'s feelings and helping them'],
    },
    {
        id: 'q4',
        text: 'When you face a difficult challenge at school, what do you do?',
        options: ['Break it down step-by-step and research solutions', 'Think outside the box and try creative approaches', 'Make a study plan and work through it systematically', 'Form a study group and work with classmates'],
    },
    {
        id: 'q5',
        text: 'What type of environment helps you learn and work best?',
        options: ['Quiet spaces with technology and tools', 'Inspiring spaces with art, music, and creative materials', 'Libraries or organized study areas with books and resources', 'Social spaces where I can collaborate and discuss with others'],
    },
    {
        id: 'q6',
        text: 'What motivates you most about your future career?',
        options: ['Creating innovative solutions and advancing technology', 'Expressing myself and inspiring others through creativity', 'Discovering new knowledge and sharing it with the world', 'Making a positive difference in people\'s lives and communities'],
    },
    {
        id: 'q7',
        text: 'If you could shadow a professional for a day, who would you choose?',
        options: ['A software engineer, scientist, or tech entrepreneur', 'An artist, designer, musician, or filmmaker', 'A teacher, researcher, journalist, or author', 'A doctor, counselor, social worker, or community leader'],
    },
    {
        id: 'q8',
        text: 'What kind of projects excite you most?',
        options: ['Building apps, conducting experiments, or solving technical puzzles', 'Creating art, writing stories, or designing something beautiful', 'Researching topics deeply and presenting findings', 'Organizing events, helping others, or addressing social issues'],
    },
    {
        id: 'q9',
        text: 'Where do you see yourself working in the future?',
        options: ['Tech companies, labs, or innovation hubs', 'Studios, galleries, media companies, or creative agencies', 'Schools, universities, research institutions, or libraries', 'Hospitals, community centers, non-profits, or government agencies'],
    },
    {
        id: 'q10',
        text: 'What would make you feel most fulfilled in your career?',
        options: ['Developing cutting-edge technology that changes how people live', 'Creating beautiful or meaningful work that touches people\'s hearts', 'Advancing human knowledge and educating future generations', 'Directly helping people overcome challenges and improve their lives'],
    },
];



// Function to get questions based on age group
export const getQuestions = (ageGroup: '5-10' | '11-17' | undefined) => {
    if (ageGroup === '5-10') {
        return questionsYoung;
    } else {
        return questionsOlder;
    }
};

// Keep the default export for backward compatibility
export const questions = questionsOlder;

interface QuizProps {
  onSubmit: (answers: Record<string, string>) => void;
  onProgressUpdate: (progress: number) => void;
  isLoading: boolean;
  ageGroup: '5-10' | '11-17' | undefined;
}

const Quiz: React.FC<QuizProps> = ({ onSubmit, onProgressUpdate, isLoading, ageGroup }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestions = getQuestions(ageGroup);

  useEffect(() => {
    const progress = (currentQuestionIndex / currentQuestions.length) * 100 * 0.5;
    onProgressUpdate(progress);
  }, [currentQuestionIndex, onProgressUpdate]);

  const handleAnswerChange = (questionId: string, answerText: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerText }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;

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
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{currentQuestionIndex + 1}</span>
            </div>
          </motion.div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight px-4">
            {currentQuestion.text}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-3">
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                  className={`h-auto py-6 px-6 text-wrap text-left w-full rounded-xl transition-all duration-300 ${
                    answers[currentQuestion.id] === option
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-0 hover:from-emerald-600 hover:to-teal-700'
                      : 'border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:border-gray-600'
                  }`}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      answers[currentQuestion.id] === option
                        ? 'border-white bg-white'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {answers[currentQuestion.id] === option && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                    <span className="text-base font-medium leading-relaxed">{option}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between w-full max-w-4xl pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>

            {isLastQuestion ? (
              <Button
                size="lg"
                onClick={() => onSubmit(answers)}
                disabled={isLoading || !answers[currentQuestion.id]}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2 w-5 h-5" />
                    Analyzing Your Answers...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Discover My Future
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Next Question <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </motion.div>
    </AnimatePresence>
  );
};

export default Quiz;
