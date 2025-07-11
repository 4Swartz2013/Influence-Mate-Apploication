/**
 * Confidence scoring types and interfaces
 */

export interface ConfidenceScore {
  value: number;
  method: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FieldConfidence extends ConfidenceScore {
  field: string;
}

export interface ContactConfidence {
  email?: ConfidenceScore;
  location?: ConfidenceScore;
  bio?: ConfidenceScore;
  phone?: ConfidenceScore;
  username?: ConfidenceScore;
  name?: ConfidenceScore;
  overall: ConfidenceScore;
}

export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export interface FieldData {
  value: string;
  confidence: number;
  source?: string;
  timestamp?: Date;
}

export type MergeStrategy = 'max' | 'weighted' | 'average' | 'first' | 'last';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  details?: Record<string, any>;
}