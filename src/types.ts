export interface User {
  id: number;
  email: string;
  plan: 'free' | 'pro';
  validations_this_month: number;
}

export interface ValidationOutput {
  demand_score: number;
  demand_reason: string;
  competition_intensity: number;
  competition_reason: string;
  differentiation_potential: number;
  monetization_difficulty: number;
  scalability_score: number;
  verdict: 'BUILD' | 'BUILD WITH REFINEMENT' | 'DO NOT BUILD';
  niche_narrowing: string;
  unique_positioning_angles: string[];
  first_100_customer_strategy: string;
  suggested_price_range: string;
}

export interface Validation {
  id: number;
  user_id: number;
  idea_name: string;
  idea_description: string;
  target_audience: string;
  product_format: string;
  expected_price: string;
  target_country: string;
  ai_output: ValidationOutput;
  created_at: string;
}
