export interface ChristmasFormData {
  // Questions 1-5 (Radio buttons)
  q1?: string; // Which AI tool do you currently use most often?
  q2?: string; // AI is currently:
  q3?: string; // Team size:
  q4?: string; // How much work could be automated?
  q5?: string; // Would you like a free AI Tools Analysis?
  
  // Questions 6-10 (Text inputs)
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string; // Optional
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  type: 'grand' | 'offer' | 'fun';
  probability: number; // 0-1
}

export interface GameResult {
  gameName: string;
  score?: number;
  prize: Prize;
  timestamp: number;
}

export interface ChristmasCookie {
  emailHash: string;
  timestamp: number;
  email: string; // Stored for reference, but cookie name uses hash
}

