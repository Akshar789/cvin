/**
 * Subscription Access Control Utilities
 * Manages feature access based on 3-tier subscription model:
 * - Free: Limited AI usage, basic features, watermark
 * - Monthly: Full access to all CV creation tools
 * - Monthly Plus: All Monthly features + advanced AI modes + premium features
 */

export type SubscriptionTier = 'free' | 'monthly' | 'monthly_plus';

export interface AIUsageLimits {
  // Free plan limits
  maxGenerationsPerSection: number;  // Max AI generations per CV section
  maxEnhanceClicks: number;          // Max AI enhance clicks total
  maxResponsibilities: number;       // Max responsibilities per job (free: 3, paid: 5-10)
  maxSkills: number;                 // Max skills generated (free: 5, paid: 8-15)
}

export interface FeatureAccess {
  canGenerateAI: boolean;
  canEnhance: boolean;
  canUsePremiumTemplates: boolean;
  canExportMultiFormat: boolean;
  canUseAdvancedAIModes: boolean;
  hasWatermark: boolean;
  aiUsageLimits: AIUsageLimits;
}

/**
 * Get feature access based on subscription tier
 */
export function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  switch (tier) {
    case 'free':
      return {
        canGenerateAI: true,  // Limited
        canEnhance: false,    // No enhance on free
        canUsePremiumTemplates: false,
        canExportMultiFormat: false,
        canUseAdvancedAIModes: false,
        hasWatermark: true,
        aiUsageLimits: {
          maxGenerationsPerSection: 2,
          maxEnhanceClicks: 0,  // No enhance for free users
          maxResponsibilities: 3,
          maxSkills: 5,
        },
      };
    
    case 'monthly':
      return {
        canGenerateAI: true,
        canEnhance: true,
        canUsePremiumTemplates: true,
        canExportMultiFormat: false,  // Only Monthly Plus
        canUseAdvancedAIModes: false,  // Only Monthly Plus
        hasWatermark: false,
        aiUsageLimits: {
          maxGenerationsPerSection: 999,  // Unlimited
          maxEnhanceClicks: 999,          // Unlimited
          maxResponsibilities: 10,
          maxSkills: 15,
        },
      };
    
    case 'monthly_plus':
      return {
        canGenerateAI: true,
        canEnhance: true,
        canUsePremiumTemplates: true,
        canExportMultiFormat: true,
        canUseAdvancedAIModes: true,
        hasWatermark: false,
        aiUsageLimits: {
          maxGenerationsPerSection: 999,  // Unlimited
          maxEnhanceClicks: 999,          // Unlimited
          maxResponsibilities: 15,
          maxSkills: 15,
        },
      };
    
    default:
      return getFeatureAccess('free');
  }
}

/**
 * Check if user can perform AI action
 */
export function canUseAIFeature(
  tier: SubscriptionTier,
  featureType: 'generate' | 'enhance',
  currentUsage?: { generations?: number; enhances?: number }
): { allowed: boolean; reason?: string } {
  const access = getFeatureAccess(tier);
  
  if (featureType === 'enhance' && !access.canEnhance) {
    return { 
      allowed: false, 
      reason: 'AI enhancement is available on Monthly and Monthly Plus plans' 
    };
  }
  
  if (featureType === 'generate') {
    const generations = currentUsage?.generations || 0;
    if (generations >= access.aiUsageLimits.maxGenerationsPerSection) {
      return { 
        allowed: false, 
        reason: `You've reached the limit of ${access.aiUsageLimits.maxGenerationsPerSection} AI generations per section. Upgrade to Monthly for unlimited access.` 
      };
    }
  }
  
  if (featureType === 'enhance') {
    const enhances = currentUsage?.enhances || 0;
    if (enhances >= access.aiUsageLimits.maxEnhanceClicks) {
      return { 
        allowed: false, 
        reason: `You've reached your AI enhancement limit. Upgrade to Monthly for unlimited enhancements.` 
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Get upgrade message based on feature
 */
export function getUpgradeMessage(feature: string, tier: SubscriptionTier): string {
  if (tier === 'free') {
    return `Unlock ${feature} with CVin Monthly or Monthly Plus`;
  }
  if (tier === 'monthly') {
    return `Get ${feature} with CVin Monthly Plus`;
  }
  return '';
}

/**
 * Get subscription tier from string (handles database values)
 */
export function parseSubscriptionTier(tierString?: string | null): SubscriptionTier {
  if (!tierString) return 'free';
  
  const normalized = tierString.toLowerCase().replace(/[_-]/g, '');
  
  if (normalized.includes('monthlyplus') || normalized.includes('plus')) {
    return 'monthly_plus';
  }
  if (normalized.includes('monthly')) {
    return 'monthly';
  }
  return 'free';
}
