import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  password: text("password"),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  oauthProvider: text("oauth_provider"),
  oauthProviderId: text("oauth_provider_id"),
  profilePicture: text("profile_picture"),
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  language: text("language").default("en").notNull(),
  freeCredits: integer("free_credits").default(5).notNull(),
  cvGenerations: integer("cv_generations").default(0).notNull(),
  textImprovements: integer("text_improvements").default(0).notNull(),
  interviewSets: integer("interview_sets").default(0).notNull(),
  totalTokensUsed: integer("total_tokens_used").default(0).notNull(),
  monthlyTokensUsed: integer("monthly_tokens_used").default(0).notNull(),
  monthlyTokenLimit: integer("monthly_token_limit"),
  dailyTokensUsed: integer("daily_tokens_used").default(0).notNull(),
  dailyTokenLimit: integer("daily_token_limit"),
  lastTokenResetDate: timestamp("last_token_reset_date"),
  role: text("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  location: text("location"),
  nationality: text("nationality"),
  linkedin: text("linkedin"),
  // Onboarding Fields - Section 2: Professional Targeting
  targetJobTitle: text("target_job_title"), // Legacy field - kept for backward compatibility
  targetJobDomain: text("target_job_domain"), // New broader job domain field
  careerLevel: text("career_level"),
  industry: text("industry"),
  yearsOfExperience: text("years_of_experience"),
  preferredLanguage: text("preferred_language").default("Both"),
  // Onboarding Fields - Section 3: Career Background
  educationLevel: text("education_level"),
  degreeLevel: text("degree_level"), // Diploma, Bachelor, Master, PhD, Other
  educationSpecialization: text("education_specialization"), // Major/Specialization field
  mostRecentJobTitle: text("most_recent_job_title"),
  mostRecentCompany: text("most_recent_company"),
  employmentStatus: text("employment_status"),
  // Onboarding Fields - Section 4: Interests & Strengths
  strengths: jsonb("strengths"),
  careerInterests: jsonb("career_interests"),
  // Profile Summary (AI-generated or user-written)
  professionalSummary: text("professional_summary"),
  selectedTemplate: text("selected_template"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cvs = pgTable("cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  templateId: integer("template_id").references(() => templates.id),
  personalInfo: jsonb("personal_info").notNull(),
  contentAr: jsonb("content_ar"),
  summary: text("summary"),
  language: text("language").default("en").notNull(),
  textDirection: text("text_direction").default("ltr").notNull(),
  atsScore: integer("ats_score"),
  isPublic: boolean("is_public").default(false).notNull(),
  publicSlug: text("public_slug").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }).notNull(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  field: text("field").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }).notNull(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  achievements: jsonb("achievements"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }).notNull(),
  category: text("category").notNull(),
  skillsList: jsonb("skills_list").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPremium: boolean("is_premium").default(false).notNull(),
  language: text("language").default("en").notNull(),
  previewImage: text("preview_image"),
  cssStyles: jsonb("css_styles").notNull(),
  layout: jsonb("layout").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tier: text("tier").notNull(),
  status: text("status").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PDPL Compliance: User Consent & Privacy Tracking
export const userConsent = pgTable("user_consent", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  // Required Consents (PDPL Mandatory)
  dataProcessingConsent: boolean("data_processing_consent").default(false).notNull(),
  aiGenerationConsent: boolean("ai_generation_consent").default(false).notNull(),
  documentStorageConsent: boolean("document_storage_consent").default(false).notNull(),
  profileGenerationConsent: boolean("profile_generation_consent").default(false).notNull(),
  // Optional Consents
  featureUpdatesConsent: boolean("feature_updates_consent").default(false).notNull(),
  analyticsConsent: boolean("analytics_consent").default(false).notNull(),
  surveyConsent: boolean("survey_consent").default(false).notNull(),
  // Privacy Settings
  profileVisibility: text("profile_visibility").default("private").notNull(), // private, link-only, public
  allowAnonDataSharing: boolean("allow_anon_data_sharing").default(false).notNull(),
  allowAnonStatsSharing: boolean("allow_anon_stats_sharing").default(false).notNull(),
  // Tracking
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  lastConsentUpdateAt: timestamp("last_consent_update_at").defaultNow(),
  ipAddress: text("ip_address"), // For audit trail
  userAgent: text("user_agent"), // For audit trail
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PDPL Compliance: Data Access & Deletion Logs
export const dataAccessLog = pgTable("data_access_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // "export", "delete", "access", "correction"
  dataType: text("data_type"), // "profile", "documents", "cv", "all"
  status: text("status").notNull(), // "pending", "completed", "failed"
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  reason: text("reason"), // User reason for request
  notes: text("notes"), // Admin notes
});

export const coverLetters = pgTable("cover_letters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  jobTitle: text("job_title"),
  company: text("company"),
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const careerTips = pgTable("career_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  language: text("language").default("en").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  feature: text("feature").notNull(),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  feature: text("feature").notNull(),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  estimatedCost: text("estimated_cost"),
  model: text("model"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guestCvs = pgTable("guest_cvs", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  templateId: text("template_id"),
  cvData: jsonb("cv_data"),
  cvDataAr: jsonb("cv_data_ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customSections = pgTable("custom_sections", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  structureType: text("structure_type").notNull(),
  content: jsonb("content").notNull(),
  language: text("language").default("en").notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cvExports = pgTable("cv_exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cvId: integer("cv_id").references(() => cvs.id, { onDelete: 'cascade' }).notNull(),
  templateId: text("template_id"),
  format: text("format").notNull(),
  language: text("language"),
  success: boolean("success").default(true).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  tier: text("tier").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("SAR").notNull(),
  cvDownloadsLimit: integer("cv_downloads_limit"),
  aiRequestsPerDay: integer("ai_requests_per_day"),
  templateAccess: text("template_access"),
  photoInCv: boolean("photo_in_cv").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: jsonb("value"),
  category: text("category"),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guestUsers = pgTable("guest_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  location: text("location"),
  city: text("city"),
  country: text("country").default("Saudi Arabia"),
  targetJobDomain: text("target_job_domain"),
  careerLevel: text("career_level"),
  latestJobTitle: text("latest_job_title"),
  templateId: text("template_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobDomains = pgTable("job_domains", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  keywords: jsonb("keywords"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const careerLevels = pgTable("career_levels", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uaeCities = pgTable("uae_cities", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  emirate: text("emirate"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saudiCities = pgTable("saudi_cities", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  region: text("region"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  cvs: many(cvs),
  subscriptions: many(subscriptions),
  coverLetters: many(coverLetters),
  usageLogs: many(usageLogs),
}));

export const cvsRelations = relations(cvs, ({ one, many }) => ({
  user: one(users, {
    fields: [cvs.userId],
    references: [users.id],
  }),
  education: many(education),
  experience: many(experience),
  skills: many(skills),
  coverLetters: many(coverLetters),
}));

export const educationRelations = relations(education, ({ one }) => ({
  cv: one(cvs, {
    fields: [education.cvId],
    references: [cvs.id],
  }),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  cv: one(cvs, {
    fields: [experience.cvId],
    references: [cvs.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  cv: one(cvs, {
    fields: [skills.cvId],
    references: [cvs.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
  cv: one(cvs, {
    fields: [coverLetters.cvId],
    references: [cvs.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CV = typeof cvs.$inferSelect;
export type InsertCV = typeof cvs.$inferInsert;
export type Education = typeof education.$inferSelect;
export type InsertEducation = typeof education.$inferInsert;
export type Experience = typeof experience.$inferSelect;
export type InsertExperience = typeof experience.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type InsertCoverLetter = typeof coverLetters.$inferInsert;
export type CareerTip = typeof careerTips.$inferSelect;
export type InsertCareerTip = typeof careerTips.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;
export type GuestCv = typeof guestCvs.$inferSelect;
export type InsertGuestCv = typeof guestCvs.$inferInsert;
export type GuestUser = typeof guestUsers.$inferSelect;
export type InsertGuestUser = typeof guestUsers.$inferInsert;
export type JobDomain = typeof jobDomains.$inferSelect;
export type CareerLevel = typeof careerLevels.$inferSelect;
export type UaeCity = typeof uaeCities.$inferSelect;
export type SaudiCity = typeof saudiCities.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
