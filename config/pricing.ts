/**
 * Centralized Pricing Configuration
 * 
 * This module manages all subscription tiers and their Stripe price IDs.
 * Price IDs are loaded from environment variables to keep them out of the codebase.
 * 
 * Setup:
 * 1. Create products in Stripe Dashboard (https://dashboard.stripe.com/products)
 * 2. Copy the price IDs (start with 'price_')
 * 3. Add to Replit Secrets or .env file
 * 
 * Required Environment Variables:
 * - STRIPE_PRICE_REGULAR_MONTHLY (optional - defaults to test mode)
 * - STRIPE_PRICE_PLUS_MONTHLY (optional - defaults to test mode)
 * - STRIPE_PRICE_ANNUAL (optional - defaults to test mode)
 */

export interface PlanConfig {
  id: string;
  name: string;
  nameKey: string;
  price: string;
  priceSAR: string;
  period: string;
  priceId?: string; // Stripe price ID (optional for free tier)
  mode: 'subscription' | 'payment';
  tier: 'free' | 'regular' | 'plus' | 'annual';
  highlighted: boolean;
  badge: string;
  features: string[];
  href?: string; // For free tier registration
}

// Test mode price IDs (placeholders - replace with real IDs in production)
const TEST_PRICE_IDS = {
  regular: 'price_test_regular_monthly',
  plus: 'price_test_plus_monthly',
  annual: 'price_test_annual_yearly',
};

// Load Stripe price IDs from environment (with test mode fallbacks)
const STRIPE_PRICE_IDS = {
  regular: process.env.STRIPE_PRICE_REGULAR_MONTHLY || TEST_PRICE_IDS.regular,
  plus: process.env.STRIPE_PRICE_PLUS_MONTHLY || TEST_PRICE_IDS.plus,
  annual: process.env.STRIPE_PRICE_ANNUAL || TEST_PRICE_IDS.annual,
};

// Check if we're using real Stripe price IDs (start with price_)
export const isProductionPricing = !STRIPE_PRICE_IDS.regular.includes('test');

// Warning for development mode
if (!isProductionPricing && typeof window === 'undefined') {
  console.warn(
    '⚠️  Using test Stripe price IDs. Payment checkout will fail.\n' +
    '   Set STRIPE_PRICE_REGULAR_MONTHLY, STRIPE_PRICE_PLUS_MONTHLY, and STRIPE_PRICE_ANNUAL\n' +
    '   See STRIPE_SETUP.md for configuration instructions.'
  );
}

/**
 * All subscription plans with Stripe integration
 */
export const PRICING_PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free Trial',
    nameKey: 'pricing.freeTitle',
    price: '$0',
    priceSAR: 'SAR 0',
    period: 'forever',
    mode: 'subscription',
    tier: 'free',
    highlighted: false,
    badge: '',
    features: [
      '3 CVs',
      '3 AI improvements',
      '1 interview prep',
      'Basic ATS scan',
      'Basic templates',
      'PDF export',
    ],
    href: '/auth/register', // Direct registration for free
  },
  {
    id: 'regular',
    name: 'Regular',
    nameKey: 'pricing.regularTitle',
    price: '$9.99',
    priceSAR: 'SAR 37',
    period: '/month',
    priceId: STRIPE_PRICE_IDS.regular,
    mode: 'subscription',
    tier: 'regular',
    highlighted: false,
    badge: '',
    features: [
      'Unlimited CVs',
      'Unlimited improvements',
      'All templates',
      'Standard AI (GPT-4o-mini)',
      'Cover letter generator',
      'ATS optimization',
      'Interview prep',
      'Tailor CV to job',
      'Multi-format export',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    nameKey: 'pricing.plusTitle',
    price: '$19.99',
    priceSAR: 'SAR 75',
    period: '/month',
    priceId: STRIPE_PRICE_IDS.plus,
    mode: 'subscription',
    tier: 'plus',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Everything in Regular, plus:',
      'Advanced AI (GPT-4o)',
      'Career Coach',
      'LinkedIn optimizer',
      'IDP generator',
      'Priority support',
      'Early access',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    nameKey: 'pricing.annualTitle',
    price: '$99',
    priceSAR: 'SAR 370',
    period: '/year',
    priceId: STRIPE_PRICE_IDS.annual,
    mode: 'subscription',
    tier: 'annual',
    highlighted: false,
    badge: 'Save 58%',
    features: [
      'All Plus features',
      '58% savings',
      '2 months free',
      'Annual billing',
    ],
  },
];

/**
 * Get a plan by its tier
 */
export function getPlanByTier(tier: string): PlanConfig | undefined {
  return PRICING_PLANS.find(plan => plan.tier === tier);
}

/**
 * Get a plan by its Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return PRICING_PLANS.find(plan => plan.priceId === priceId);
}

/**
 * Get all paid plans (exclude free)
 */
export function getPaidPlans(): PlanConfig[] {
  return PRICING_PLANS.filter(plan => plan.tier !== 'free');
}

/**
 * Check if a tier is considered "premium" (Plus or Annual)
 */
export function isPremiumTier(tier: string): boolean {
  return tier === 'plus' || tier === 'annual' || tier === 'premium' || tier === 'yearly' || tier === 'lifetime';
}

/**
 * Check if a tier is considered "paid" (not free)
 */
export function isPaidTier(tier: string): boolean {
  return tier !== 'free';
}
