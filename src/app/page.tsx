
"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, User, Image as ImageIcon, Repeat, Download, LoaderCircle, SkipForward, Stars, Zap, Brain, Target, Camera } from 'lucide-react';
import { answerMCQQuestions, generateFutureSelfVisualization, MCQAnswers } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/header';
import Quiz, { questions } from '@/components/quiz';
import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";

type Step = 'intro' | 'age' | 'gender' | 'quiz' | 'simple-form' | 'camera' | 'summary' | 'upload' | 'generating' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('intro');
  const [ageGroup, setAgeGroup] = useState<'5-10' | '11-17' | undefined>(undefined);
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);

  const [profileSummary, setProfileSummary] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [mindset, setMindset] = useState('');
  const [suggestedProfession, setSuggestedProfession] = useState('');
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [futureImage, setFutureImage] = useState<string | null>(null);
  const [futureSelfTitle, setFutureSelfTitle] = useState<string>('');
  const [futureSelfDescription, setFutureSelfDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // New states for 5-10 age group
  const [studentName, setStudentName] = useState('');
  const [dreamProfession, setDreamProfession] = useState('');

  const { toast } = useToast();

  // Handler for simple form submission (5-10 age group)
  const handleSimpleFormSubmit = () => {
    if (!studentName.trim() || !dreamProfession.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "We need your name and what you want to become!",
        variant: "destructive",
      });
      return;
    }

    setSuggestedProfession(dreamProfession);
    setFutureSelfTitle(`Future ${dreamProfession}`);
    setStep('camera');
  };

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    setIsLoading(true);
    
    const formattedAnswers: MCQAnswers = {};
    for (const qId in answers) {
      const question = questions.find(q => q.id === qId);
      if (question) {
        formattedAnswers[question.text] = answers[qId];
      }
    }

    try {
      const result = await answerMCQQuestions(formattedAnswers, ageGroup);
      setProfileSummary(result.summary);
      
      // Handle both string and array cases
      const interestsArray = Array.isArray(result.interests) 
        ? result.interests 
        : result.interests.split(',').map(i => i.trim()).filter(Boolean);
      
      setInterests(interestsArray);
      setMindset(result.mindset);
      setSuggestedProfession(result.suggestedProfession);
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
    setIsLoading(true);
    setStep('generating');
    
    try {
      const result = await generateFutureSelfVisualization({
        photoDataUri: userImage ?? null,
        interests: interests.join(', '),
        mindset: mindset,
        suggestedProfession: suggestedProfession,
        gender: gender ?? null
      });

      setFutureImage(result.generatedImage);
      setFutureSelfDescription(result.futureSelfDescription);
      setFutureSelfTitle(`Future ${suggestedProfession}`);
      setStep('result');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Vision",
        description: "Could not generate your future self. Please try again.",
        variant: "destructive"
      });
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPhoto = () => {
    setUserImage(undefined);
    handleImageSubmit();
  };

  // Handler for camera capture (both age groups)
  const handleCameraCapture = (dataUri: string | null) => {
    if (dataUri) {
      setUserImage(dataUri);
      setStep('generating');

      // Use appropriate generation function based on age group
      if (ageGroup === '5-10') {
        handleSimpleImageGeneration(dataUri);
      } else {
        handleImageSubmit();
      }
    }
  };

  // Simple image generation for 5-10 age group
  const handleSimpleImageGeneration = async (imageData: string) => {
    setIsLoading(true);

    try {
      const result = await generateFutureSelfVisualization({
        photoDataUri: imageData,
        interests: dreamProfession,
        mindset: `A young student who dreams of becoming a ${dreamProfession}`,
        suggestedProfession: dreamProfession,
        gender: gender ?? null
      });

      setFutureImage(result.generatedImage);
      setFutureSelfTitle(`Future ${dreamProfession}`);
      setFutureSelfDescription(`Meet ${studentName}, a future ${dreamProfession}! With dedication and hard work, ${studentName} will achieve their dreams and make a positive impact in the world of ${dreamProfession.toLowerCase()}.`);
      setStep('result');

      toast({
        title: "Your future is ready!",
        description: `Here's ${studentName} as a future ${dreamProfession}!`,
      });
    } catch (error) {
      console.error('Error generating future self:', error);
      toast({
        title: "Something went wrong",
        description: "We couldn't create your future image. Please try again!",
        variant: "destructive",
      });
      setStep('camera');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep('intro');
    setAgeGroup(undefined);
    setGender(undefined);
    setProfileSummary('');
    setInterests([]);
    setMindset('');
    setSuggestedProfession('');
    setUserImage(undefined);
    setFutureImage(null);
    setFutureSelfTitle('');
    setFutureSelfDescription('');
    setProgress(0);
    // Reset new state variables
    setStudentName('');
    setDreamProfession('');
  };

  const downloadImage = () => {
    if (futureImage && studentName) {
      // Create a card for both age groups with name and profession
      downloadCard();
    }
  };

  const downloadCard = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !futureImage) return;

    // 16x20 ratio dimensions (portrait orientation)
    canvas.width = 1600; // 16 inches at 100 DPI
    canvas.height = 2000; // 20 inches at 100 DPI

    // Create white background to match the result page
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw the generated image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Main image section - takes up most of the card like on result page
      const imgSize = Math.min(canvas.width - 120, canvas.height - 400); // Leave space for text
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = 60;

      // Draw the main image exactly as shown on result page
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 48); // Larger corner radius for bigger image
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();

      // Add subtle border like on result page
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 48);
      ctx.stroke();

      // Name section
      const nameY = imgY + imgSize + 80;
      ctx.fillStyle = '#1f2937'; // Dark gray
      ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(studentName, canvas.width / 2, nameY);

      // Profession title
      const professionY = nameY + 80;
      ctx.fillStyle = '#374151'; // Slightly lighter gray
      ctx.font = 'bold 60px system-ui, -apple-system, sans-serif';
      const profession = ageGroup === '5-10' ? dreamProfession : suggestedProfession;
      ctx.fillText(`Future ${profession}`, canvas.width / 2, professionY);

      // Add AI-generated description if available
      if (futureSelfDescription) {
        const descriptionY = professionY + 80;
        ctx.fillStyle = '#374151'; // Darker gray for description
        ctx.font = '42px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';

        // Word wrap the description
        const maxWidth = canvas.width - 200; // Margins
        const words = futureSelfDescription.split(' ');
        let line = '';
        let currentY = descriptionY;
        const lineHeight = 60;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, currentY);
      }

      // Footer section with branding - small text as requested
      const footerY = canvas.height - 60;
      ctx.fillStyle = '#9ca3af'; // Light gray
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('by FutureSelf AI', canvas.width / 2, footerY);

      // Download the card
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const profession = ageGroup === '5-10' ? dreamProfession : suggestedProfession;
          link.download = `${studentName}-future-${profession.toLowerCase().replace(/\s+/g, '-')}-16x20-card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.src = futureImage;
  };


  
  const progressValue = useMemo(() => {
    switch (step) {
      case 'intro': return 0;
      case 'age': return 5;
      case 'gender': return 10;
      case 'simple-form': return 25;
      case 'camera': return 50;
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <CardHeader className="relative z-10 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 relative"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                  MVAFutureSelf AI
                   <CardTitle className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">  
                    Powered by Skill Satron Tecnologies Pvt.Ltd
                   </CardTitle>
                 </CardTitle>
                <CardDescription className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Discover your potential through AI-powered insights. Answer personalized questions and visualize your future self in your dream career.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-8">
              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                  <Brain className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-sm">AI Analysis</h3>
                  <p className="text-xs text-muted-foreground text-center">Smart questionnaire tailored to your age</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                  <Target className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-sm">Career Matching</h3>
                  <p className="text-xs text-muted-foreground text-center">Discover careers that fit your interests</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-700">
                  <Zap className="w-8 h-8 text-cyan-600 mb-2" />
                  <h3 className="font-semibold text-sm">Visual Future</h3>
                  <p className="text-xs text-muted-foreground text-center">See yourself in your dream profession</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  size="lg"
                  onClick={() => setStep('age')}
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Stars className="mr-2 w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </CardContent>
          </motion.div>
        );
      case 'age':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <CardHeader className="pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                What's Your Age?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                We'll customize the experience just for you
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant={ageGroup === '5-10' ? 'default' : 'outline'}
                    onClick={() => setAgeGroup('5-10')}
                    className={`h-28 w-full text-lg flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ${
                      ageGroup === '5-10'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg border-0 hover:from-green-600 hover:to-emerald-700'
                        : 'border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <div className="font-bold text-xl leading-tight">5-10 Years</div>
                      <div className="text-sm opacity-90 font-medium">Elementary School</div>
                      <div className="text-xs opacity-75">Fun & Simple Questions</div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant={ageGroup === '11-17' ? 'default' : 'outline'}
                    onClick={() => setAgeGroup('11-17')}
                    className={`h-28 w-full text-lg flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ${
                      ageGroup === '11-17'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg border-0 hover:from-blue-600 hover:to-purple-700'
                        : 'border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <div className="font-bold text-xl leading-tight">11-17 Years</div>
                      <div className="text-sm opacity-90 font-medium">Middle & High School</div>
                      <div className="text-xs opacity-75">Detailed Career Exploration</div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {ageGroup && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6"
                >
                  <Button
                    size="lg"
                    onClick={() => setStep('gender')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Continue Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        );
      case 'gender':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <CardHeader className="pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Tell Us About You
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                This helps us create your personalized future vision
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    variant={gender === 'male' ? 'default' : 'outline'}
                    onClick={() => setGender('male')}
                    className={`w-full h-16 text-lg rounded-xl transition-all duration-300 ${
                      gender === 'male'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg border-0 hover:from-blue-600 hover:to-indigo-700'
                        : 'border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <User className="mr-3 w-6 h-6" />
                    <span className="font-semibold">Male</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    variant={gender === 'female' ? 'default' : 'outline'}
                    onClick={() => setGender('female')}
                    className={`w-full h-16 text-lg rounded-xl transition-all duration-300 ${
                      gender === 'female'
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg border-0 hover:from-pink-600 hover:to-rose-700'
                        : 'border-2 border-dashed border-pink-300 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    }`}
                  >
                    <User className="mr-3 w-6 h-6" />
                    <span className="font-semibold">Female</span>
                  </Button>
                </motion.div>
              </div>

              {gender && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <Button
                    size="lg"
                    onClick={() => setStep(ageGroup === '5-10' ? 'simple-form' : 'quiz')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {ageGroup === '5-10' ? 'Tell Us About Yourself' : 'Start the Quiz'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        );
      case 'simple-form':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Tell Us About Yourself!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                We're excited to learn about your dreams and create your future!
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-md space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What do you want to become when you grow up?
                  </label>
                  <input
                    type="text"
                    value={dreamProfession}
                    onChange={(e) => setDreamProfession(e.target.value)}
                    placeholder="e.g., Doctor, Teacher, Astronaut, Artist..."
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  size="lg"
                  onClick={handleSimpleFormSubmit}
                  disabled={!studentName.trim() || !dreamProfession.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Camera className="mr-2 w-5 h-5" />
                  Take My Photo
                </Button>
              </motion.div>
            </CardContent>
          </motion.div>
        );
      case 'camera':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {ageGroup === '5-10' ? `Take Your Photo, ${studentName}!` : `Add Your Photo, ${studentName}!`}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                {ageGroup === '5-10'
                  ? `Let's capture your photo to create your future as a ${dreamProfession}`
                  : `Upload or take a photo to visualize your future career`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full flex justify-center"
              >
                <ImageUploader onImageUpload={handleCameraCapture} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground max-w-md">
                  {ageGroup === '5-10'
                    ? `📸 Choose to upload a photo or take one with your camera! We'll create an amazing picture of you as a future ${dreamProfession}!`
                    : `📸 Upload a photo from your device or take one with your camera for the best results!`
                  }
                </p>
              </motion.div>
            </CardContent>
          </motion.div>
        );

      case 'quiz':
        return <Quiz onSubmit={handleQuizSubmit} onProgressUpdate={setProgress} isLoading={isLoading} ageGroup={ageGroup} />;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Add Your Photo
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Upload or take a clear, front-facing photo for the best results
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 flex flex-col items-center">
              {/* Name Input for 11-17 age group */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md"
              >
                <div className="space-y-2">
                  <label htmlFor="student-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    What's your name?
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full flex justify-center"
              >
                <ImageUploader onImageUpload={(dataUri) => setUserImage(dataUri || undefined)} />
              </motion.div>

              {/* Photo Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-md"
              >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
                    📸 Photo Tips for Best Results:
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Face the camera directly</li>
                    <li>• Ensure good lighting</li>
                    <li>• Keep a neutral expression</li>
                    <li>• Avoid sunglasses or hats</li>
                  </ul>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
              >
                <Button
                  size="lg"
                  onClick={handleImageSubmit}
                  disabled={!userImage || !studentName.trim() || isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2 w-5 h-5" />
                      Creating Your Future...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Generate My Future Self
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSkipPhoto}
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <SkipForward className="mr-2 w-5 h-5" />
                  Continue Without Photo
                </Button>
              </motion.div>

              {/* Privacy Note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground max-w-md">
                  🔒 Your photo is processed securely and is not stored permanently.
                  We respect your privacy and only use it to generate your future visualization.
                </p>
              </motion.div>
            </CardContent>
          </motion.div>
        );
      case 'generating':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center justify-center space-y-8 p-12"
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 border-4 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
                style={{
                  backgroundClip: 'padding-box',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-8 h-8 text-purple-600" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <motion.h2
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Crafting Your Future...
              </motion.h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Our AI is analyzing your responses and creating a personalized vision of your future career
              </p>
            </div>

            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Analyzing your interests and mindset</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Matching you with ideal career paths</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span>Generating your future visualization</span>
              </motion.div>
            </div>
          </motion.div>
        );
      case 'result':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Stars className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {ageGroup === '5-10' ? `${studentName}'s Future!` : `${studentName}'s Future Awaits!`}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {ageGroup === '5-10'
                  ? `Here's how ${studentName} might look as a ${dreamProfession}!`
                  : `Here's how ${studentName} might look working as a ${suggestedProfession}`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 flex flex-col items-center">
              {/* Image Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {ageGroup === '5-10' ? `${studentName} as a Future ${dreamProfession}` : `${studentName} as a Future ${suggestedProfession}`}
                </h2>
                <p className="text-muted-foreground">
                  {ageGroup === '5-10'
                    ? `Look how amazing ${studentName} looks as a ${dreamProfession}!`
                    : `Look how amazing ${studentName} looks as a ${suggestedProfession}!`
                  }
                </p>
              </motion.div>

              {/* Generated Image Section - Prominently displayed */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative group w-full max-w-2xl"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-white dark:border-gray-600">
                  {futureImage ? (
                    <>
                      <img
                        src={futureImage}
                        alt="Your Generated Future Self"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Image overlay with title */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                        <h4 className="text-white font-bold text-xl text-center">
                          Your Future Self as a {suggestedProfession}
                        </h4>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center space-y-4">
                      <ImageIcon className="w-20 h-20 opacity-50" />
                      <span className="text-lg font-medium">Generating your future image...</span>
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-32 rounded"></div>
                    </div>
                  )}

                  {/* Hover overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Floating decorative elements around the image */}
                <motion.div
                  className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg flex items-center justify-center"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Stars className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg"
                  animate={{
                    x: [0, -10, 0],
                    rotate: [0, -180, -360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <motion.div
                  className="absolute top-1/4 -right-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full shadow-lg"
                  animate={{
                    y: [0, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Visual Separator */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-4 w-full max-w-md"
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
              </motion.div>

              {/* Career Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-2xl"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Your Career Vision
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your personality and interests
                  </p>
                </div>

                <div className="p-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">
                        {futureSelfTitle}
                      </h4>
                    </div>
                    <p className="text-white/90 leading-relaxed text-lg text-center">
                      {futureSelfDescription}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4 pt-6 flex-wrap"
              >
                <Button
                  variant="outline"
                  onClick={resetApp}
                  className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                >
                  <Repeat className="mr-2 w-4 h-4" /> Start New Journey
                </Button>
                <Button
                  onClick={downloadImage}
                  disabled={!futureImage}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Download className="mr-2 w-4 h-4" />
                  {ageGroup === '5-10' ? 'Download My Card' : 'Save My Future'}
                </Button>
              </motion.div>
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 font-sans antialiased">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <Header />
      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          <Card className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-card-foreground shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={step}>
                {step !== 'intro' && step !== 'generating' && (
                  <div className="p-6 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Progress: {Math.round(progressValue)}%
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Step {
                          step === 'age' ? '1' :
                          step === 'gender' ? '2' :
                          step === 'quiz' ? '3' :
                          step === 'summary' ? '4' :
                          step === 'upload' ? '5' :
                          step === 'result' ? '6' : '1'
                        } of 6
                      </span>
                    </div>
                    <Progress
                      value={progressValue}
                      className="w-full h-3 transition-all duration-500 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20"
                    />
                  </div>
                )}
                <div className="relative">
                  {renderContent()}
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
