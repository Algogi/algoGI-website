"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitChristmasForm } from '@/app/christmas/actions';
import { isWorkEmail, getWorkEmailErrorMessage } from '@/lib/utils/email-validation';
import { trackQuestionnaireAbandoned, trackQuestionView } from '@/lib/analytics/ga4';
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
  companyWebsite: string;
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
  { id: 'companyWebsite', label: 'Company website', type: 'url', required: true },
  { id: 'email', label: 'Work email', type: 'email', required: true },
  { id: 'phone', label: 'Phone number (optional)', type: 'tel', required: false },
];

const TOTAL_STEPS = QUESTIONS.length + 1; // 5 questions + 1 contact form page

/**
 * Get question ID and step type from step number
 */
function getStepInfo(step: number): { questionId?: string; stepType: string } {
  if (step === 0) {
    return { stepType: 'welcome' };
  }
  
  const questionIndex = step - 1;
  
  if (questionIndex < QUESTIONS.length) {
    return {
      questionId: QUESTIONS[questionIndex].id,
      stepType: 'question',
    };
  }
  
  // After all questions, it's the contact form page
  if (questionIndex === QUESTIONS.length) {
    return {
      questionId: 'contact-form',
      stepType: 'contact_form',
    };
  }
  
  return { stepType: 'unknown' };
}

export default function Questionnaire() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    companyWebsite: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [companyWebsiteError, setCompanyWebsiteError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const questionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isSubmittedRef = useRef(false);
  const contactFormFocusedRef = useRef(false);
  const fieldRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Track question views when step changes
  useEffect(() => {
    if (currentStep > 0) {
      const { questionId, stepType } = getStepInfo(currentStep);
      trackQuestionView(currentStep, questionId, stepType);
    }
  }, [currentStep]);

  // Handle focus when navigating to contact form
  useEffect(() => {
    const contactFormStep = QUESTIONS.length + 1;
    if (currentStep === contactFormStep) {
      // Reset focus flag when entering contact form
      contactFormFocusedRef.current = false;
      
      // Focus on field with error or first empty required field after animation
      const focusField = () => {
        let fieldToFocus: string | null = null;
        
        if (emailError) {
          fieldToFocus = 'email';
        } else if (companyWebsiteError) {
          fieldToFocus = 'companyWebsite';
        } else {
          // Find first empty required field
          for (const field of TEXT_FIELDS) {
            if (field.required) {
              const value = formData[field.id as keyof FormData] as string | undefined;
              if (!value?.trim()) {
                fieldToFocus = field.id;
                break;
              }
            }
          }
          // Default to first field if all are filled
          if (!fieldToFocus) {
            fieldToFocus = TEXT_FIELDS[0]?.id;
          }
        }
        
        if (fieldToFocus) {
          const fieldElement = fieldRefs.current.get(fieldToFocus);
          if (fieldElement && !contactFormFocusedRef.current) {
            setTimeout(() => {
              fieldElement.focus();
              contactFormFocusedRef.current = true;
            }, 350);
          }
        }
      };
      
      focusField();
    } else {
      // Reset focus flag when leaving contact form
      contactFormFocusedRef.current = false;
    }
    // Only depend on currentStep and errors - formData is accessed via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, emailError, companyWebsiteError]);

  // Track abandonment on page unload
  useEffect(() => {
    const handleAbandonment = () => {
      // Don't track if form was successfully submitted
      if (isSubmittedRef.current) {
        return;
      }
      
      // Only track if user has progressed past welcome screen
      if (currentStep > 0) {
        const { questionId, stepType } = getStepInfo(currentStep);
        trackQuestionnaireAbandoned(currentStep, questionId, stepType, TOTAL_STEPS);
      }
    };

    // Listen for page unload events
    // beforeunload: desktop browsers, page close/navigation
    // pagehide: mobile browsers, more reliable for unload tracking
    window.addEventListener('beforeunload', handleAbandonment);
    window.addEventListener('pagehide', handleAbandonment);
    
    return () => {
      window.removeEventListener('beforeunload', handleAbandonment);
      window.removeEventListener('pagehide', handleAbandonment);
    };
  }, [currentStep]);

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
          // On contact form page, don't allow arrow navigation - user must fill form
          canProceedNow = false;
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
        } else if (questionIndex === QUESTIONS.length) {
          // On contact form, Enter should submit if all fields are valid
          // But we'll handle this in the form submission, not here
          canProceedNow = false;
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
    // Clear errors when user starts typing - validation will happen on blur only
    if (fieldId === 'email' && emailError) {
      setEmailError(null);
    }
    if (fieldId === 'companyWebsite' && companyWebsiteError) {
      setCompanyWebsiteError(null);
    }
    // Clear field-specific errors when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleEmailBlur = (email: string) => {
    // Only validate on blur, not while typing
    if (!email.trim()) {
      // If required field is empty, show error
      setEmailError('Work email is required');
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

  const handleCompanyWebsiteBlur = (url: string) => {
    // Only validate on blur, not while typing
    if (!url.trim()) {
      // If required field is empty, show error
      setCompanyWebsiteError('Company website is required');
      return;
    }
    
    // URL validation - must start with http:// or https://
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        setCompanyWebsiteError('URL must start with http:// or https://');
        return;
      }
      setCompanyWebsiteError(null);
    } catch {
      setCompanyWebsiteError('Invalid URL format. Please include http:// or https://');
    }
  };

  const handleRequiredFieldBlur = (fieldId: string, value: string, fieldLabel: string) => {
    // Validation only happens on blur for required fields
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [fieldId]: `${fieldLabel} is required` }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [fieldId]: null }));
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
    
    // Check contact form fields - if any required field is missing, return contact form step
    for (let i = 0; i < TEXT_FIELDS.length; i++) {
      const field = TEXT_FIELDS[i];
      if (field.required) {
        const value = formData[field.id as keyof FormData] as string;
        if (!value?.trim()) {
          return QUESTIONS.length + 1; // Contact form step (after all questions)
        }
        // For email field, also check if it's a work email
        if (field.id === 'email' && value?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim()) || !isWorkEmail(value.trim())) {
            return QUESTIONS.length + 1; // Contact form step
          }
        }
        // For company website field, check URL format
        if (field.id === 'companyWebsite' && value?.trim()) {
          try {
            const urlObj = new URL(value.trim());
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
              return QUESTIONS.length + 1; // Contact form step
            }
          } catch {
            return QUESTIONS.length + 1; // Contact form step
          }
        }
      }
    }
    
    return null;
  };


  const handleSubmit = async () => {
    // Validate all required contact fields
    const contactFormStep = QUESTIONS.length + 1;
    
    // First, check if all required fields are filled (before format validation)
    const missingStep = findFirstMissingField();
    if (missingStep !== null) {
      toast.error('Please fill in all required fields.');
      setCurrentStep(missingStep);
      return;
    }
    
    // Now validate format for filled required fields
    // Validate email
    if (!formData.email?.trim()) {
      toast.error('Work email is required');
      setCurrentStep(contactFormStep);
      setEmailError('Work email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Invalid email format');
      setCurrentStep(contactFormStep);
      setEmailError('Invalid email format');
      return;
    }
    
    if (!isWorkEmail(formData.email.trim())) {
      toast.error(getWorkEmailErrorMessage());
      setCurrentStep(contactFormStep);
      setEmailError(getWorkEmailErrorMessage());
      return;
    }
    
    // Validate company website
    if (!formData.companyWebsite?.trim()) {
      toast.error('Company website is required');
      setCurrentStep(contactFormStep);
      setCompanyWebsiteError('Company website is required');
      return;
    }
    
    try {
      const urlObj = new URL(formData.companyWebsite.trim());
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        toast.error('URL must start with http:// or https://');
        setCurrentStep(contactFormStep);
        setCompanyWebsiteError('URL must start with http:// or https://');
        return;
      }
    } catch {
      toast.error('Invalid URL format. Please include http:// or https://');
      setCurrentStep(contactFormStep);
      setCompanyWebsiteError('Invalid URL format. Please include http:// or https://');
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
        const isWebsiteError = errorMessage.includes('website') || errorMessage.includes('url');
        
        // Navigate back to contact form if there's a validation error
        setCurrentStep(contactFormStep);
        
        // Also check if email format is invalid client-side (for generic validation errors)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValue = formData.email?.trim() || '';
        const isEmailInvalid = emailValue && (!emailRegex.test(emailValue) || !isWorkEmail(emailValue));
        
        if (isEmailError || isEmailInvalid) {
          if (isEmailInvalid && emailValue) {
            if (!emailRegex.test(emailValue)) {
              setEmailError('Invalid email format');
            } else if (!isWorkEmail(emailValue)) {
              setEmailError(getWorkEmailErrorMessage());
            }
          }
        }
        
        if (isWebsiteError) {
          setCompanyWebsiteError('Invalid URL format. Please include http:// or https://');
        }
        
        setIsSubmitting(false);
      } else {
        // Mark as submitted before redirect
        isSubmittedRef.current = true;
        toast.success('Form submitted successfully! Redirecting to games...');
      }
      // If successful, redirect happens in the server action
    } catch (err: any) {
      // Redirect errors are expected and should be ignored
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        // Mark as submitted when redirect happens (successful submission)
        isSubmittedRef.current = true;
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

  const renderContactForm = () => {
    return (
      <motion.div
        key="contact-form"
        ref={(el) => {
          if (el) {
            questionRefs.current.set('contact-form', el);
          } else {
            questionRefs.current.delete('contact-form');
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
        className="space-y-4 sm:space-y-6 w-full px-4 max-w-2xl mx-auto"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 text-center christmas-title drop-shadow-lg">
          Contact Information
        </h2>
        <div className="space-y-4 sm:space-y-5">
          {TEXT_FIELDS.map((field) => {
            const value = formData[field.id as keyof FormData] as string | undefined || '';
            const isEmailField = field.id === 'email';
            const isCompanyWebsiteField = field.id === 'companyWebsite';
            const showEmailError = isEmailField && emailError;
            const showWebsiteError = isCompanyWebsiteField && companyWebsiteError;
            const showFieldError = !isEmailField && !isCompanyWebsiteField && fieldErrors[field.id];
            const hasError = showEmailError || showWebsiteError || showFieldError;

            return (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={field.id}
                  className="block text-base sm:text-lg font-semibold text-white drop-shadow-sm"
                >
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                  ref={(el) => {
                    // Store ref for programmatic focusing, but don't auto-focus here
                    // Focus is handled in useEffect when step changes
                    if (el) {
                      fieldRefs.current.set(field.id, el);
                    } else {
                      fieldRefs.current.delete(field.id);
                    }
                  }}
                  id={field.id}
                  type={field.type}
                  value={value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  onBlur={() => {
                    // Validation only happens on blur, not while typing
                    if (isEmailField) {
                      handleEmailBlur(value);
                    } else if (isCompanyWebsiteField) {
                      handleCompanyWebsiteBlur(value);
                    } else if (field.required) {
                      handleRequiredFieldBlur(field.id, value, field.label);
                    }
                  }}
                  className={`w-full p-3 sm:p-4 md:p-5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-base sm:text-lg placeholder-gray-300 border-2 transition-all ${
                    hasError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-red-500/50 focus:border-red-500'
                  } focus:outline-none`}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  required={field.required}
                />
                {showEmailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm sm:text-base font-medium drop-shadow-sm"
                  >
                    {emailError}
                  </motion.p>
                )}
                {showWebsiteError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm sm:text-base font-medium drop-shadow-sm"
                  >
                    {companyWebsiteError}
                  </motion.p>
                )}
                {showFieldError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm sm:text-base font-medium drop-shadow-sm"
                  >
                    {fieldErrors[field.id]}
                  </motion.p>
                )}
              </div>
            );
          })}
        </div>
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

    // After all questions, show contact form
    if (questionIndex === QUESTIONS.length) {
      return renderContactForm();
    }

    return null;
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
    
    // On contact form page, canProceed is not used - submit button handles validation
    return false;
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
              disabled={
                !formData.firstName || 
                !formData.lastName || 
                !formData.company || 
                !formData.companyWebsite || 
                !formData.email || 
                isSubmitting
              }
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
