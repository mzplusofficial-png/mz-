
export interface UserProfile {
  id: string;
  full_name: string;
  referral_code: string;
  rank_id: number;
  rank_name?: string;
  email?: string;
  is_admin?: boolean;
  admin_role?: 'super_admin' | 'marketing_admin' | null;
  rpa_balance?: number;
  rpa_points?: number;
  user_level: 'standard' | 'niveau_mz_plus';
  created_at?: string;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  preview_url: string;
  max_preview_seconds: number;
  created_at: string;
  chapters?: { title: string }[];
  order_index?: number;
}

export interface UserSuggestion {
  id: string;
  user_id: string;
  type: 'suggestion' | 'problem';
  category: string;
  priority_improvement: string;
  suggestion: string;
  created_at: string;
  users?: {
    full_name: string;
    user_level: string;
  };
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  account: string; 
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

export interface CoachingRequest {
  id: string;
  user_id: string;
  objective: string;
  difficulty: string;
  experience: 'debutant' | 'intermediaire' | 'avance';
  availability: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_coach?: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
    user_level: string;
  };
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'premium';
  is_read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_amount: number;
  image_url: string;
  final_link: string;
}

export interface RPASubmission {
  id: string;
  user_id: string;
  type: 'sale' | 'recruitment' | 'video';
  data: any;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

export interface Commission {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  products?: Product;
  users?: {
    full_name: string;
    email: string;
  };
}

export interface ProductStat {
  product_id: string;
  clicks: number;
}

export interface PremiumWelcomePopup {
  id: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
}

export type TabId = 'dashboard' | 'revenus' | 'affiliation' | 'team' | 'admin' | 'rpa' | 'coaching' | 'formation' | 'upgrade' | 'suggestions' | 'private_group' | 'community' | 'private_chat' | 'recompense' | 'flash_offer' | 'admin_push' | 'private_messaging' | 'luna_chat' | 'guides' | 'sql_console' | 'profile' | 'catalog';
