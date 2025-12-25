"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitChristmasForm } from '@/app/christmas/actions';
import { isWorkEmail, getWorkEmailErrorMessage } from '@/lib/utils/email-validation';
import ProgressBar from './ProgressBar';
import ChristmasBackground from './ChristmasBackground';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FormData {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
}

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Which AI tool do you currently use most often?',
    type: 'radio' as const,
    options: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'Not actively using AI yet'],
  },
  {
    id: 'q2',
    text: 'AI is currently:',
    type: 'radio' as const,
    options: ['Improving productivity and outcomes', 'Creating mixed or unclear results', 'Not delivering value yet'],
  },
  {
    id: 'q3',
    text: 'Team size:',
    type: 'radio' as const,
    options: ['1–2', '3–10', '11–50', '50+'],
  },
  {
    id: 'q4',
    text: 'Realistically, how much of your current work could be automated with AI over the next 24 months?',
    type: 'radio' as const,
    options: ['0–20%', '20–50%', '50%+', 'We don\'t plan to replace people with AI'],
  },
  {
    id: 'q5',
    text: 'Would you like a free AI Tools Analysis Report tailored to your business?',
    type: 'radio' as const,
    options: ['Yes', 'No'],
  },
];

const TEXT_FIELDS = [
  { id: 'firstName', label: 'First name', type: 'text', required: true },
  { id: 'lastName', label: 'Last name', type: 'text', required: true },
  { id: 'company', label: 'Company name', type: 'text', required: true },
  { id: 'email', label: 'Work email', type: 'email', required: true },
  { id: 'phone', label: 'Phone number (optional)', type: 'tel', required: false },
];

const TOTAL_STEPS = QUESTIONS.length + TEXT_FIELDS.length + 1; // +1 for final step

export default function Questionnaire() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS) {
        const questionIndex = currentStep - 1;
        let canProceedNow = false;
        
        if (currentStep === 0) {
          canProceedNow = true;
        } else if (questionIndex < QUESTIONS.length) {
          const questionId = QUESTIONS[questionIndex].id;
          canProceedNow = !!formData[questionId as keyof FormData];
        } else {
          const textFieldIndex = questionIndex - QUESTIONS.length;
          if (textFieldIndex < TEXT_FIELDS.length) {
            const field = TEXT_FIELDS[textFieldIndex];
            if (field.required) {
              const value = formData[field.id as keyof FormData] as string;
              canProceedNow = !!value?.trim();
            } else {
              canProceedNow = true;
            }
          } else {
            canProceedNow = true;
          }
        }
        
        if (canProceedNow) {
          setDirection(1);
          setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
        }
      } else if (e.key === 'Enter' && currentStep > 0 && currentStep < TOTAL_STEPS) {
        const questionIndex = currentStep - 1;
        let canProceedNow = false;
        
        if (questionIndex < QUESTIONS.length) {
          const questionId = QUESTIONS[questionIndex].id;
          canProceedNow = !!formData[questionId as keyof FormData];
        } else {
          const textFieldIndex = questionIndex - QUESTIONS.length;
          if (textFieldIndex < TEXT_FIELDS.length) {
            const field = TEXT_FIELDS[textFieldIndex];
            if (field.required) {
              const value = formData[field.id as keyof FormData] as string;
              canProceedNow = !!value?.trim();
            } else {
              canProceedNow = true;
            }
          } else {
            canProceedNow = true;
          }
        }
        
        if (canProceedNow) {
          e.preventDefault();
          setDirection(1);
          nextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, formData]);

  // Auto-focus text input when step changes to a text input field
  // This is handled via callback ref in renderTextInput for better reliability


  const handleRadioChange = (questionId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      setDirection(1);
      nextStep();
    }, 300);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear email error when user starts typing
    if (fieldId === 'email' && emailError) {
      setEmailError(null);
    }
  };

  const handleEmailBlur = (email: string) => {
    if (!email.trim()) {
      setEmailError(null);
      return;
    }
    
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return;
    }
    
    // Work email validation
    if (!isWorkEmail(email)) {
      setEmailError(getWorkEmailErrorMessage());
    } else {
      setEmailError(null);
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClearCookie = async () => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/christmas/clear-cookie', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cookies and game records cleared! You can now test again.');
        // Reload the page to reset the form state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to clear cookies');
      }
    } catch (error) {
      toast.error('Failed to clear cookies');
      console.error('Error clearing cookies:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const findFirstMissingField = (): number | null => {
    // Check questions first (q1-q5)
    for (let i = 0; i < QUESTIONS.length; i++) {
      const questionId = QUESTIONS[i].id;
      if (!formData[questionId as keyof FormData]) {
        return i + 1; // +1 because step 0 is welcome
      }
    }
    
    // Check text fields
    for (let i = 0; i < TEXT_FIELDS.length; i++) {
      const field = TEXT_FIELDS[i];
      if (field.required) {
        const value = formData[field.id as keyof FormData] as string;
        if (!value?.trim()) {
          return QUESTIONS.length + i + 1; // +1 for welcome step
        }
        // For email field, also check if it's a work email
        if (field.id === 'email' && value?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim()) || !isWorkEmail(value.trim())) {
            return QUESTIONS.length + i + 1; // +1 for welcome step
          }
        }
      }
    }
    
    return null;
  };


  const handleSubmit = async () => {
    // Validate email if filled
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Invalid email format');
        const emailStep = QUESTIONS.length + 3 + 1; // email is at index 3 in TEXT_FIELDS
        setCurrentStep(emailStep);
        setEmailError('Invalid email format');
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
        return;
      }
      
      if (!isWorkEmail(formData.email.trim())) {
        toast.error(getWorkEmailErrorMessage());
        const emailStep = QUESTIONS.length + 3 + 1; // email is at index 3 in TEXT_FIELDS
        setCurrentStep(emailStep);
        setEmailError(getWorkEmailErrorMessage());
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
        return;
      }
    }
    
    // Find first missing field
    const missingStep = findFirstMissingField();
    
    if (missingStep !== null) {
      toast.error('Please fill in all required fields.');
      // Navigate to the missing step
      setCurrentStep(missingStep);
      
      // If it's a text input field, focus it after animation
      const questionIndex = missingStep - 1;
      const textFieldIndex = questionIndex - QUESTIONS.length;
      if (textFieldIndex >= 0 && textFieldIndex < TEXT_FIELDS.length) {
        // Wait for animation to complete, then focus
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
      
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSubmit.append(key, value);
        }
      });

      const result = await submitChristmasForm(formDataToSubmit);
      
      if (result && !result.success) {
        toast.error(result.error || 'Failed to submit form. Please try again.');
        
        // Check if error is related to email validation
        const errorMessage = result.error?.toLowerCase() || '';
        const isEmailError = errorMessage.includes('email') || errorMessage.includes('invalid') || errorMessage.includes('work email') || errorMessage.includes('personal email');
        
        // Also check if email format is invalid client-side (for generic validation errors)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValue = formData.email?.trim() || '';
        const isEmailInvalid = emailValue && (!emailRegex.test(emailValue) || !isWorkEmail(emailValue));
        
        if (isEmailError || isEmailInvalid) {
          // Navigate to email field (step 9: QUESTIONS.length (5) + email index (3) + 1 for welcome)
          const emailStep = QUESTIONS.length + 3 + 1; // email is at index 3 in TEXT_FIELDS
          setCurrentStep(emailStep);
          if (isEmailInvalid && emailValue) {
            if (!emailRegex.test(emailValue)) {
              setEmailError('Invalid email format');
            } else if (!isWorkEmail(emailValue)) {
              setEmailError(getWorkEmailErrorMessage());
            }
          }
          setTimeout(() => {
            inputRef.current?.focus();
          }, 500);
        }
        
        setIsSubmitting(false);
      } else {
        toast.success('Form submitted successfully! Redirecting to games...');
      }
      // If successful, redirect happens in the server action
    } catch (err: any) {
      // Redirect errors are expected and should be ignored
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      toast.error(err?.message || 'Failed to submit form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const renderWelcome = () => (
    <motion.div
      key="welcome"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="text-center space-y-6 w-full px-4"
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 christmas-title drop-shadow-lg">
        Welcome to Our Christmas Campaign!
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-8 christmas-subtitle drop-shadow-md">
        Answer a few questions and play festive games to win amazing prizes!
      </p>
      <Button
        onClick={nextStep}
        variant="outline"
        className="border-2 border-red-500 text-white hover:bg-red-500/20 hover:border-red-400 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg"
      >
        Get Started →
      </Button>
    </motion.div>
  );

  const renderRadioQuestion = (question: typeof QUESTIONS[0], stepIndex: number) => {
    const currentValue = formData[question.id as keyof FormData] as string | undefined;

    return (
      <motion.div
        key={question.id}
        ref={(el) => {
          if (el) {
            questionRefs.current.set(question.id, el);
          } else {
            questionRefs.current.delete(question.id);
          }
        }}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="space-y-6 w-full px-4"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center christmas-title drop-shadow-lg">
          {question.text}
        </h2>
        <RadioGroup
          value={currentValue || ''}
          onValueChange={(value) => handleRadioChange(question.id, value)}
          className="space-y-3 sm:space-y-4"
        >
          {question.options.map((option) => (
            <motion.div
              key={option}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all cursor-pointer ${
                currentValue === option
                  ? 'border-red-500 bg-red-500/20 backdrop-blur-sm'
                  : 'border-red-500/50 bg-white/10 hover:bg-white/20 hover:border-red-500/70 backdrop-blur-sm'
              }`}
            >
              <RadioGroupItem
                value={option}
                id={`${question.id}-${option}`}
                className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-red-500/50 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500/20 [&>span>svg]:fill-red-500 [&>span>svg]:text-red-500 flex-shrink-0"
              />
              <Label
                htmlFor={`${question.id}-${option}`}
                className="flex-1 text-base sm:text-lg md:text-xl font-semibold text-white cursor-pointer drop-shadow-sm"
              >
                {option}
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      </motion.div>
    );
  };

  const renderTextInput = (field: typeof TEXT_FIELDS[0], stepIndex: number) => {
    const value = formData[field.id as keyof FormData] as string | undefined || '';
    const isEmailField = field.id === 'email';
    const showError = isEmailField && emailError;

    return (
      <motion.div
        key={field.id}
        ref={(el) => {
          if (el) {
            questionRefs.current.set(field.id, el);
          } else {
            questionRefs.current.delete(field.id);
          }
        }}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="space-y-6 w-full px-4"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center christmas-title drop-shadow-lg">
          {field.label}
        </h2>
        <div className="space-y-2">
          <input
            ref={(el) => {
              // TypeScript workaround for ref assignment in conditional render
              const ref = inputRef as { current: HTMLInputElement | null };
              ref.current = el;
              // Auto-focus when the input is mounted and animation completes
              if (el) {
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    el?.focus();
                  }, 350); // Wait for animation to complete
                });
              }
            }}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onBlur={() => {
              if (isEmailField) {
                handleEmailBlur(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (field.required) {
                  // For required fields, only proceed if value is filled and valid
                  if (value.trim()) {
                    if (isEmailField) {
                      // Validate email before proceeding
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(value.trim())) {
                        setEmailError('Invalid email format');
                        return;
                      }
                      if (!isWorkEmail(value.trim())) {
                        setEmailError(getWorkEmailErrorMessage());
                        return;
                      }
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }
                } else {
                  // For optional fields, always allow Enter to proceed
                  e.preventDefault();
                  e.stopPropagation();
                  nextStep();
                }
              }
            }}
            className={`w-full p-3 sm:p-4 md:p-6 rounded-lg bg-white/10 backdrop-blur-sm text-white text-base sm:text-lg md:text-xl placeholder-gray-300 border-2 transition-all ${
              showError
                ? 'border-red-500 focus:border-red-500'
                : 'border-red-500/50 focus:border-red-500'
            } focus:outline-none`}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            required={field.required}
          />
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm sm:text-base font-medium drop-shadow-sm"
            >
              {emailError}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  };

  const renderFinalStep = () => {
    return (
      <motion.div
        key="final"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="space-y-6 w-full px-4"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center christmas-title drop-shadow-lg">
          Ready to Play?
        </h2>
      </motion.div>
    );
  };

  const getCurrentContent = () => {
    if (currentStep === 0) {
      return renderWelcome();
    }

    const questionIndex = currentStep - 1;
    
    if (questionIndex < QUESTIONS.length) {
      return renderRadioQuestion(QUESTIONS[questionIndex], questionIndex);
    }

    const textFieldIndex = questionIndex - QUESTIONS.length;
    
    if (textFieldIndex < TEXT_FIELDS.length) {
      return renderTextInput(TEXT_FIELDS[textFieldIndex], textFieldIndex);
    }

    return renderFinalStep();
  };

  const totalSlides = TOTAL_STEPS + 1; // +1 for welcome slide

  const canProceed = () => {
    if (currentStep === 0) return true; // Welcome slide
    
    const questionIndex = currentStep - 1;
    
    // Check if it's a question slide
    if (questionIndex < QUESTIONS.length) {
      const questionId = QUESTIONS[questionIndex].id;
      return !!formData[questionId as keyof FormData];
    }
    
    // Check if it's a text input slide
    const textFieldIndex = questionIndex - QUESTIONS.length;
    if (textFieldIndex < TEXT_FIELDS.length) {
      const field = TEXT_FIELDS[textFieldIndex];
      if (field.required) {
        const value = formData[field.id as keyof FormData] as string;
        return !!value?.trim();
      }
      return true; // Optional field
    }
    
    return true; // Final slide
  };

  return (
    <div className="min-h-screen christmas-page-bg relative overflow-hidden">
      <ChristmasBackground />
      {/* Dev-only clear cookie button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleClearCookie}
            disabled={isClearing}
            variant="outline"
            size="sm"
            className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20 hover:border-yellow-400 disabled:opacity-50 text-xs px-3 py-1.5 shadow-lg bg-black/50 backdrop-blur-sm"
          >
            {isClearing ? 'Clearing...' : '🧹 Clear Cookie (Dev)'}
          </Button>
        </div>
      )}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="w-full max-w-2xl mb-4 sm:mb-6 px-2">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>
        )}

        {/* Slide Content */}
        <div className="w-full max-w-2xl relative overflow-hidden flex-1 flex items-center justify-center">
          <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] w-full flex items-center justify-center py-4">
            <AnimatePresence mode="wait" custom={direction}>
              {getCurrentContent()}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-2xl mt-4 sm:mt-6 md:mt-8 flex items-center justify-between gap-2 sm:gap-4 px-2">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="border-2 border-red-500 text-white hover:bg-red-500/20 hover:border-red-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-red-500/30 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 shadow-lg"
          >
            ← Previous
          </Button>

          {currentStep === TOTAL_STEPS ? (
            <Button
              onClick={handleSubmit}
              disabled={!formData.firstName || !formData.lastName || !formData.company || !formData.email || isSubmitting}
              variant="outline"
              className="border-2 border-red-500 text-white hover:bg-red-500/20 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 shadow-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Play →'}
            </Button>
          ) : null}
        </div>

        {/* Keyboard Hint */}
        {currentStep > 0 && currentStep < TOTAL_STEPS && (
          <div className="mt-2 sm:mt-4 text-white/50 text-xs sm:text-sm text-center drop-shadow-sm">
            Use ← → arrow keys to navigate • Press Enter to continue
          </div>
        )}
      </div>
    </div>
  );
}
