# CVin - Professional CV/Resume Builder

## Overview
CVin is a comprehensive, bilingual (Arabic/English) CV builder platform designed to help users create professional, ATS-compliant resumes. It features AI-powered tools for content generation, optimization, and career enhancement, integrated with a tiered subscription model. The platform aims to streamline the job application process by offering advanced CV building, optimization, and career guidance functionalities, ultimately enhancing users' job application success.

## User Preferences
- Keep error messages friendly and helpful.
- Guide users to appropriate tier upgrades.
- All features connected to OpenAI API for quality results.
- Mobile-first responsive design with 44px minimum tap targets.
- Premium SaaS visual design with navy gradient headers.

## System Architecture
CVin is built with a modern web stack, prioritizing a seamless user experience and robust backend functionality.

### UI/UX Decisions
- **Bilingual Support**: Full Arabic (RTL) and English (LTR) language support with proper layout adjustments and a language toggle, including independent text direction control per CV. Every CV is automatically saved in both languages, with AI-powered translation for content. The site UI language is decoupled from the CV content language.
- **Role-Based CV Builder**: Guided CV creation flow with role selection (Student vs Professional/Employer) and tailored AI-powered suggestions.
- **Career Tools Section**: Reusable component for displaying career tools (LinkedIn Optimizer, Interview Prep, AI Career Coach, Job Analyst, Job Posting) with animated icons and premium badges.
- **Settings Page Redesign**: Premium SaaS settings page with a dark navy hero section, floating pill-style tab navigation, modern card-based sections, sticky save/cancel bar on mobile, and proper database mapping. Includes editable education and work experience sections, dynamic subscription status, and working change password/delete account functionalities. Profile data display syncs with UI language.
- **Dashboard Redesign**: Premium SaaS dashboard with dark navy hero section, glassmorphic stat cards, personalized greetings, and modern CV management section.
- **Homepage Redesign**: Dark navy hero section with gradient background, trust badges, animated statistics, AI-powered section simulation, template showcase, and modern CTA.
- **Header/Navigation Redesign**: Backdrop blur sticky header, animated hamburger menu, and improved navigation.
- **Footer Redesign**: 4-column grid layout with logo, contact info, and navigation links.
- **Premium SaaS Design**: Consistent visual design with navy gradient headers, brand-colored CTAs, card-based layouts, and custom typography.
- **ATS-Compliant Design**: CV headers and formatting optimized for Applicant Tracking Systems.
- **Nationality Auto-Fill**: During CV creation, selecting a Saudi city auto-fills nationality as "Saudi" (English) or "سعودي" (Arabic) based on CV content language. Saved in personalInfo and persisted to DB. Editable in the CV edit page. Existing CVs auto-fill nationality on edit page load if empty.
- **Job Domain Bilingual Display**: `getJobTitle()` utility resolves `targetJobDomain` slugs (e.g. `it-software-dev`) to correct localized names using an inline lookup table. All 20 templates pass `isArabic` to ensure job domain always appears in the correct language with no fallback mixing.
- **CV Preview & Edit Enhancements**: Increased preview scale, section-based content protection, WYSIWYG rich text editor, and scoped right-click/copy/drag protection on preview container.
- **Education Summary Edit Field**: CV Edit page and Preview & Edit page (`/cv/preview`) both include an editable "Education Summary (Optional)" single-line input field for each education entry. Has an "AI Generate" button that generates a concise one-sentence summary (max 20 words) via `/api/ai/generate-description`. Bilingual, auto-saves on generation. Available for both guest and logged-in users.
- **Smart Template Recommendation (Redesigned)**: "AI Career Design Assistant" branding with CPU icon. 12-column grid layout: LEFT (5 cols) shows recommended template cards in a vertical scrollable list with compact inline "Use" buttons, RIGHT (7 cols) shows a large live preview panel (620px, scale 0.58) with template name header and footer "Use This Template" button. The user's current template appears as a "Your Pick" card in the list for easy reselection. Recommendations show 3 free + 2 premium templates plus the current template. Container widens to max-w-5xl on this step for better space usage. Template selection persists immediately to DB via PUT /api/cvs/[id], updates sessionStorage, shows toast with template name, and the "Preview My CV" button navigates with the selected template. Premium templates blocked for free users with upgrade modal. Full bilingual support with RTL-aware layout. Scoring engine uses leadership keyword detection, career gap detection, domain-specific scoring, and content density analysis.
- **Sync From Profile Language Fix**: Experience and education sync in CV creation strictly prioritizes `englishContent` arrays when UI is in English, preventing Arabic data from appearing via top-level fallback arrays. Arabic sync uses `arabicContent` exclusively.
- **Mobile-First Design**: All pages are responsive with appropriate tap targets and font sizes.

### Technical Implementations
- **Centralized CV Data Management**: `CvDataContext` provides a single source of truth for user CV data.
- **Database-First CV Loading**: All authenticated user CV data is loaded exclusively from the database.
- **AI Integration**: Leverages OpenAI's GPT-4o and GPT-4o-mini for content generation, suggestions, and career tools.
- **Data-Driven AI Prompts**: Professional summary AI (`/api/ai/generate-profile-summary`) accepts `experiences` array, calculates total employment years from actual dates using `calculateExperienceYears()`, and passes the full employment timeline to the AI — never guesses or uses hardcoded year estimates. Skills AI (`/api/ai/suggest-skills`, `/api/cv/ai/skills`) accepts `experienceDescriptions` to generate role-specific skills derived from actual experience text, avoiding generic default lists. Education summary AI generates a single-line concise sentence (max 20 words).
- **Unlimited AI Regeneration**: Users can regenerate CV field content infinitely, with rate limiting.
- **Tier-Based Feature Access**: Features and AI model quality are dynamically routed based on subscription tier.
- **Robust Validation**: Comprehensive client-side and server-side validation for phone numbers and location (Saudi Arabia specific).
- **Scalable API Structure**: Dedicated API endpoints for AI services, CV saving, and profile updates.
- **Authenticated Downloads**: CV exports use JavaScript-based downloads with Authorization headers.
- **Template ID Integrity**: Auto-save only persists `templateId` when explicitly changed by the user. Premium template selection is blocked for free users.
- **CV Creation Integrity**: Each new CV creation always inserts a new database record.
- **Full Template Persistence Chain**: All 20 templates are supported end-to-end from guest creation through login, preview, and PDF download.
- **React-Based PDF Rendering**: All templates use React component rendering for consistent preview and PDF export.
- **Rich Text Formatting**: Experience descriptions and professional summaries preserve HTML formatting.
- **RTL Support in All Templates**: All templates support RTL layouts with appropriate font loading for Arabic exports.
- **Page Break Prevention**: Puppeteer PDF generator applies `break-inside: avoid` and CSS rules to prevent orphaned elements.

### Feature Specifications
- **AI Quick Start**: Users can upload existing CVs for AI-powered auto-filling.
- **Smart Field Suggestions**: AI assists in generating professional summaries, experience descriptions, and skill lists.
- **ATS-Compliant CV Header**: Automatically formats personal and contact information.
- **AI Generation Credits**: Free users receive limited AI generation credits.
- **Dashboard**: Prioritizes CV building, with secondary features integrated and contextually linked.
- **CV Management Page (Redesigned)**: Full redesign of the /cvs page. Premium SaaS design matching dashboard: dark navy hero section with "My Resumes" title, AI-powered subtitle, CV count badge, and "Create New CV" CTA. Responsive grid (3 desktop / 2 tablet / 1 mobile). Each card shows a scaled template thumbnail (35% scale, 180px height), CV title, template name with Free/Premium badge, last updated date, and action buttons (Edit, Download, Preview, Delete icon). Preview opens in a centered modal (max-w-2xl) with proper 66% scaled A4 preview, close button, Edit, and Download actions. No duplicate header — removed extra nav element. Duplicate CV option removed entirely.
- **CV Edit Page**: Section-by-section editing flow with validation and guided navigation.
- **CV Download Page**: Clear 3-step user flow for template selection, color themes, and download options.
- **Interview Prep & Guidance**: Comprehensive interview preparation with AI-generated personalized content.
- **LinkedIn Optimizer**: Premium feature for optimizing LinkedIn profiles via AI analysis and recommendations.
- **Template Gallery**: Provides 20 templates (13 Free, 7 Premium) with filters, hover-to-preview, and bilingual support. Free templates include: Simple Professional, Minimalist Clean, Modern, Smart, Strong, Elegant, Compact, Two Column Pro, Clean Modern, Professional Edge, Metro, Fresh Start, Nordic.
- **Profile Photo System**: Enables photo upload, change, and removal with secure server-side validation.
- **About Us Page**: Premium SaaS about page with mission, vision, features grid, and stats section. Bilingual.
- **Contact Page**: Contact page with info cards and validated form, submissions stored in DB. Bilingual.
- **Smart Template Recommendation**: Enhanced AI Career Design Assistant step in CV creation flow. Guest users see a partially visible preview with blur overlay and "Login to view full resume" CTA. Logged-in users see the full preview. Typography improved for readability (text-xl headings, text-sm template names, text-[10px] tags). All "Create New CV" buttons across the app redirect to `/template-gallery` first.
- **Sync From Profile**: Logged-in users can sync data from their existing profile/CV to auto-fill form steps, with language awareness for repeater and scalar fields.
- **Professional Summary Auto-Generation**: AI automatically generates a summary when the user reaches the Professional Summary step for the first time in a session, with an option to regenerate.
- **Job Analyst**: Premium feature for AI-powered job description analysis, matching user's CV, and providing tailored recommendations.
- **Interview Prep Routing**: Specific routing for interview prep features.

### System Design Choices
- **Tech Stack**: Next.js (React, TypeScript, TailwindCSS) for frontend and API routes, Express for backend, PostgreSQL with Drizzle ORM for the database.
- **Authentication**: JWT-based authentication.
- **PDF Generation**: Utilizes `pdf-parse` for document processing and Puppeteer Core for headless PDF generation.

## External Dependencies
- **OpenAI API**: For all AI-powered features (GPT-4o, GPT-4o-mini).
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For database interaction.
- **Stripe**: Payment gateway.
- **pdf-parse**: For parsing PDF documents.
- **Puppeteer Core**: For headless PDF generation.