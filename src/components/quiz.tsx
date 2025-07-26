
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
        options: ['Exploring new technologies or space', 'Creating art, music, or stories', 'Solving puzzles or complex problems', 'Helping others (people, animals, environment)'],
    },
    {
        id: 'q2',
        text: 'If you could learn one new skill, what would it be?',
        options: ['Coding or data analysis', 'A musical instrument or artistic technique', 'A new language or a complex theory', 'Public speaking or first aid'],
    },
    {
        id: 'q3',
        text: 'Which subject in school excites you the most, and why?',
        options: ['Science/Math - for its logic and discoveries', 'Arts/Humanities - for its creativity and stories', 'History/Social Studies - for understanding society', 'Physical Education/Health - for its focus on wellbeing'],
    },
    {
        id: 'q4',
        text: 'Do you prefer working alone or in a team?',
        options: ['Alone - I focus better on my own.', 'In a team - I thrive on collaboration.', 'A mix of both.', 'It depends on the task.'],
    },
    {
        id: 'q5',
        text: 'What do you think you are really good at?',
        options: ['Analyzing complex situations', 'Coming up with new ideas', 'Organizing and planning', 'Understanding and connecting with people'],
    },
    {
        id: 'q6',
        text: 'What is something you find challenging but want to improve?',
        options: ['Public speaking', 'Staying organized', 'Asking for help', 'Learning technical skills'],
    },
    {
        id: 'q7',
        text: 'How do you handle failure or mistakes?',
        options: ['Analyze what went wrong and learn from it.', 'Try again immediately with a different approach.', 'Take a break to reflect before trying again.', 'Seek advice from others.'],
    },
    {
        id: 'q8',
        text: 'Are you more creative or logical in your thinking?',
        options: ['Mostly logical', 'Mostly creative', 'A balance of both', 'It depends on the situation'],
    },
    {
        id: 'q9',
        text: 'Do you like following instructions or figuring things out on your own?',
        options: ['I prefer clear instructions.', 'I enjoy figuring things out myself.', 'A combination of both is ideal.', 'I like to experiment first, then check instructions.'],
    },
    {
        id: 'q10',
        text: 'When solving a problem, do you prefer experiments, discussions, or reading?',
        options: ['Hands-on experiments', 'Collaborative discussions', 'In-depth reading and research', 'A mix of all three'],
    },
    {
        id: 'q11',
        text: 'Would you rather write an essay, give a presentation, or build a project?',
        options: ['Write an essay', 'Give a presentation', 'Build a project', 'None of the above'],
    },
    {
        id: 'q12',
        text: 'How do you react when someone disagrees with you?',
        options: ['Listen to their perspective and seek understanding.', 'Explain my reasoning to persuade them.', 'Feel frustrated but try to find a compromise.', 'Agree to disagree and move on.'],
    },
    {
        id: 'q13',
        text: 'Do you like taking leadership roles in group activities?',
        options: ['Yes, I enjoy leading and motivating others.', 'Sometimes, if I feel passionate about the project.', 'No, I prefer to be a contributor.', 'I can lead if needed, but it\'s not my preference.'],
    },
    {
        id: 'q14',
        text: 'What kind of friends do you enjoy being around?',
        options: ['People who are creative and inspiring.', 'People who are intellectual and challenge me.', 'People who are supportive and empathetic.', 'People who are fun-loving and adventurous.'],
    },
    {
        id: 'q15',
        text: 'How do you handle stress or pressure?',
        options: ['Focus on the task and work through it.', 'Take short breaks to relax and refocus.', 'Talk to friends or family for support.', 'Exercise or engage in a hobby to clear my mind.'],
    },
    {
        id: 'q16',
        text: 'What profession do you admire the most, and why?',
        options: ['Scientists/Engineers - for their innovation.', 'Artists/Writers - for their creativity.', 'Doctors/Nurses - for their compassion.', 'Entrepreneurs/Leaders - for their vision.'],
    },
    {
        id: 'q17',
        text: 'If you could invent something, what would it be?',
        options: ['A tool to solve a major environmental problem.', 'A new form of art or entertainment.', 'A technology that advances human knowledge.', 'A service that helps people in need.'],
    },
    {
        id: 'q18',
        text: 'Do you see yourself working in an office, lab, outdoors, or from home?',
        options: ['A modern office or co-working space.', 'A scientific lab or workshop.', 'Outdoors in nature.', 'From home with a flexible schedule.'],
    },
    {
        id: 'q19',
        text: 'Would you prefer a job with stability or one with adventure and change?',
        options: ['A stable and secure job.', 'A dynamic job with constant new challenges.', 'A balance of both.', 'I\'m not sure yet.'],
    },
    {
        id: 'q20',
        text: 'Do you enjoy working with computers, robots, or AI tools?',
        options: ['Yes, I find it fascinating.', 'I enjoy it, but I\'m still learning.', 'Not particularly, I prefer other activities.', 'I am neutral about it.'],
    },
    {
        id: 'q21',
        text: 'Would you like to create apps, design games, or build machines?',
        options: ['Create mobile or web apps.', 'Design video games or virtual worlds.', 'Build robots or machines.', 'I\'m more interested in using them than building them.'],
    },
    {
        id: 'q22',
        text: 'How comfortable are you with learning new technology?',
        options: ['Very comfortable, I pick it up quickly.', 'Somewhat comfortable, I need some time to learn.', 'Not very comfortable, it can be frustrating.', 'It depends on the technology.'],
    },
    {
        id: 'q23',
        text: 'Is earning money, helping others, or creativity more important to you?',
        options: ['Financial security is my top priority.', 'Helping others or society is most important.', 'Creative expression and passion are key.', 'A balance of all three is ideal.'],
    },
    {
        id: 'q24',
        text: 'What kind of impact do you want to make in the world?',
        options: ['Create something innovative that changes an industry.', 'Inspire people through art or ideas.', 'Help solve a major social or environmental problem.', 'Make a positive difference in my local community.'],
    },
    {
        id: 'q25',
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
