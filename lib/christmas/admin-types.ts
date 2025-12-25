import { Prize } from './types';

/**
 * Extended form submission with admin fields
 */
export interface ChristmasSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  submittedAt: any;
  campaign: string;
  source?: string;
  // Admin fields
  contacted?: boolean;
  processed?: boolean;
  notes?: string;
}

/**
 * Game play with prize and badge info
 */
export interface ChristmasGamePlay {
  id: string;
  email: string;
  gameName: string;
  prizeId: string;
  score?: number | null;
  badgeToken?: string;
  characterId?: string;
  expiresAt?: any;
  campaign: string;
  playedAt: any;
  ipAddress?: string;
  // Extended fields
  prize?: Prize;
  badgeUrl?: string;
  redeemed?: boolean;
  fulfilled?: boolean;
}

/**
 * Analytics data structures
 */
export interface ChristmasAnalytics {
  totalSubmissions: number;
  totalGamePlays: number;
  conversionRate: number; // submissions -> game plays
  prizeDistribution: PrizeDistribution[];
  gamePopularity: GamePopularity[];
  questionAnalytics: QuestionAnalytics[];
  timeBasedStats: TimeBasedStats;
  conversionFunnel: ConversionFunnel;
  questionnaireAbandonment: QuestionnaireAbandonment[];
  questionViewStats: QuestionViewStats[];
  totalAbandonments: number;
  totalQuestionViews: number;
  abandonmentRate: number; // percentage of users who abandoned
}

export interface PrizeDistribution {
  prizeId: string;
  prizeName: string;
  prizeType: 'grand' | 'offer' | 'fun';
  count: number;
  percentage: number;
  expectedPercentage: number; // from prize probability
}

export interface GamePopularity {
  gameName: string;
  gameDisplayName: string;
  playCount: number;
  averageScore?: number;
  prizeWinRate: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  responses: QuestionResponse[];
  totalResponses: number;
}

export interface QuestionResponse {
  answer: string;
  count: number;
  percentage: number;
}

export interface TimeBasedStats {
  dailySubmissions: DailyStat[];
  hourlySubmissions: HourlyStat[];
  peakHour: number;
  peakDay: string;
}

export interface DailyStat {
  date: string;
  submissions: number;
  gamePlays: number;
}

export interface HourlyStat {
  hour: number;
  submissions: number;
  gamePlays: number;
}

export interface ConversionFunnel {
  submissions: number;
  gamePlays: number;
  prizeWins: number;
  dropOffRate: number; // submissions -> game plays
  winRate: number; // game plays -> prize wins
}

export interface QuestionnaireAbandonment {
  step: number;
  questionId?: string;
  stepType: string;
  count: number;
  percentage: number;
}

export interface QuestionViewStats {
  step: number;
  questionId?: string;
  stepType: string;
  viewCount: number;
  uniqueViews: number;
}

/**
 * Prize win statistics
 */
export interface PrizeStatistics {
  prizeId: string;
  prizeName: string;
  prizeType: 'grand' | 'offer' | 'fun';
  description: string;
  probability: number;
  winCount: number;
  winPercentage: number;
  expectedPercentage: number;
  winners: PrizeWinner[];
  totalValue?: number;
}

export interface PrizeWinner {
  id: string;
  email: string;
  gameName: string;
  playedAt: any;
  badgeToken?: string;
  redeemed?: boolean;
  fulfilled?: boolean;
}

/**
 * Badge token information
 */
export interface BadgeInfo {
  token: string;
  email: string;
  prizeId: string;
  prizeName: string;
  characterId?: string;
  createdAt: any;
  expiresAt?: any;
  badgeUrl: string;
  viewCount?: number;
  isValid: boolean;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  totalSubmissions: number;
  totalGamePlays: number;
  totalPrizesWon: number;
  conversionRate: number;
  prizeDistribution: PrizeDistribution[];
  recentSubmissions: ChristmasSubmission[];
  recentGamePlays: ChristmasGamePlay[];
  topGames: GamePopularity[];
}

/**
 * API Response types
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

