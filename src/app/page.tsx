"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, User, Image as ImageIcon, Repeat, Download, LoaderCircle } from 'lucide-react';
import { answerMCQQuestions, AnswerMCQQuestionsInput } from '@/ai/flows/answer-mcq-questions';
import { generateFutureSelfVisualization } from '@/ai/flows/generate-future-self-visualization';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/header';
import Quiz from '@/components/quiz';
import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

type Step = 'intro' | 'quiz' | 'summary' | 'upload' | 'generating' | 'result';

const quizQuestions = [
  { id: 'q1', text: 'Which of the following activities do you enjoy the most?' },
  { id: 'q2', text: 'What kind of project would excite you the most?' },
  { id: 'q3', text: 'How do you handle failure or mistakes?' },
  { id: 'q4', text: 'In a group project, what role do you naturally take?' },
  { id: 'q5', text: 'If your friend is feeling sad or anxious, what would you do?' },
  { id: 'q6', text: 'When faced with a new or difficult challenge, how do you feel?' },
  { id: 'q7', text: 'What motivates you to work hard or do well? (Choose one)' },
  { id: 'q8', text: 'What kind of future do you imagine for yourself?' },
  { id: 'q9', text: 'When learning something new, which method do you prefer?' },
  { id: 'q10', text: 'How do you usually make decisions?' },
];

export default function Home() {
  const [step, setStep] = useState<Step>('intro');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [profileSummary, setProfileSummary] = useState('');
  const [interests, setInterests] = useState('');
  const [mindset, setMindset] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [futureImage, setFutureImage] = useState<string | null>(null);
  const [futureSelfDescription, setFutureSelfDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    setIsLoading(true);
    setQuizAnswers(answers);
    
    const questionsMap = new Map(quizQuestions.map(q => [q.id, q.text]));
    const formattedAnswers: Record<string, string> = {};
    for (const qId in answers) {
      const qText = questionsMap.get(qId);
      if (qText) {
        formattedAnswers[qText] = answers[qId];
      }
    }

    const input: AnswerMCQQuestionsInput = {
      answers: formattedAnswers
    };

    try {
      const result = await answerMCQQuestions(input);
      setProfileSummary(result.summary);
      setInterests(result.interests);
      setMindset(result.mindset);
      setStep('summary');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Profile",
        description: "There was an issue creating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!userImage) {
      toast({ title: "No Image", description: "Please upload an image to continue.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setStep('generating');
    try {
      const result = await generateFutureSelfVisualization({
        photoDataUri: userImage,
        interests: interests,
        mindset: mindset,
      });
      setFutureImage(result.generatedImage);
      setFutureSelfDescription(result.futureSelfDescription);
      setStep('result');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Vision",
        description: "Could not generate your future self. Please try again.",
        variant: "destructive",
      });
      setStep('upload'); // Go back to upload step on failure
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep('intro');
    setQuizAnswers({});
    setProfileSummary('');
    setInterests('');
    setMindset('');
    setUserImage(null);
    setFutureImage(null);
    setFutureSelfDescription('');
    setProgress(0);
  };

  const downloadImage = () => {
    if (futureImage) {
      const link = document.createElement('a');
      link.href = futureImage;
      link.download = 'future-self.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const progressValue = useMemo(() => {
    switch (step) {
      case 'intro': return 0;
      case 'quiz': return progress;
      case 'summary': return 50;
      case 'upload': return 75;
      case 'generating': return 90;
      case 'result': return 100;
      default: return 0;
    }
  }, [step, progress]);
  
  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome to FutureSelf AI</CardTitle>
              <CardDescription className="pt-2">Answer a few questions to get a glimpse into your future. Let's discover your potential together!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => setStep('quiz')}>
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </motion.div>
        );
      case 'quiz':
        return <Quiz onSubmit={handleQuizSubmit} onProgressUpdate={setProgress} isLoading={isLoading} />;
      case 'summary':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <CardHeader>
              <Sparkles className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl font-bold mt-4">Your AI-Powered Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{profileSummary}</p>
              <Button size="lg" onClick={() => setStep('upload')}>
                Next: Upload Your Photo <ImageIcon className="ml-2" />
              </Button>
            </CardContent>
          </motion.div>
        );
      case 'upload':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader className="text-center">
               <User className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl font-bold mt-4">Upload a Photo</CardTitle>
              <CardDescription>Upload a clear, front-facing photo of yourself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <ImageUploader onImageUpload={setUserImage} />
              <Button size="lg" onClick={handleImageSubmit} disabled={!userImage || isLoading}>
                {isLoading ? <><LoaderCircle className="animate-spin mr-2" />Generating...</> : <>Generate My Future Self <Sparkles className="ml-2" /></>}
              </Button>
            </CardContent>
          </motion.div>
        );
      case 'generating':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center justify-center space-y-4 p-8">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Crafting your future...</h2>
            <p className="text-muted-foreground">The AI is analyzing your potential. This may take a moment.</p>
          </motion.div>
        );
      case 'result':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Your Future Awaits!</CardTitle>
              <CardDescription>Here's a vision of your future self based on your aspirations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center">
                  <h3 className="font-semibold mb-2">Your Photo</h3>
                  {userImage && <Image src={userImage} alt="User upload" width={300} height={300} className="rounded-lg shadow-md" data-ai-hint="person" />}
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="font-semibold mb-2 text-primary">Your Future Self</h3>
                  {futureImage && <Image src={futureImage} alt="Generated future self" width={300} height={300} className="rounded-lg shadow-lg border-2 border-primary" data-ai-hint="futuristic person" />}
                </div>
              </div>
              {futureSelfDescription && (
                <Card className="mt-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-card-foreground">
                  <CardContent className="p-6">
                    <p className="text-lg italic leading-relaxed text-center">{futureSelfDescription}</p>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={resetApp}>
                  <Repeat className="mr-2" /> Start Over
                </Button>
                <Button onClick={downloadImage}>
                  <Download className="mr-2" /> Download Vision
                </Button>
              </div>
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-2xl rounded-2xl border-0">
          <AnimatePresence mode="wait">
            <motion.div key={step}>
              {step !== 'intro' && step !== 'generating' && (
                <div className="p-6">
                  <Progress value={progressValue} className="w-full h-2 transition-all duration-500" />
                </div>
              )}
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </main>
    </div>
  );
}
