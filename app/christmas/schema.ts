import { z } from 'zod';
import { isWorkEmail, getWorkEmailErrorMessage } from '@/lib/utils/work-email';

export const christmasFormSchema = z.object({
  // Questions 1-5 (optional radio buttons)
  q1: z.string().optional(), // Which AI tool do you currently use most often?
  q2: z.string().optional(), // AI is currently:
  q3: z.string().optional(), // Team size:
  q4: z.string().optional(), // How much work could be automated?
  q5: z.string().optional(), // Would you like a free AI Tools Analysis?
  
  // Questions 6-10 (required text inputs)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string()
    .min(1, 'Company website is required')
    .url('Invalid URL format. Please include http:// or https://'),
  email: z.string()
    .email('Invalid email format')
    .refine((email) => isWorkEmail(email), {
      message: getWorkEmailErrorMessage(),
    }),
  phone: z.string().optional(), // Optional
});

export type ChristmasFormInput = z.infer<typeof christmasFormSchema>;

