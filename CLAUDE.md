# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Memo (智忆单词) - A Vue 3 vocabulary learning system based on the Ebbinghaus forgetting curve. Uses Supabase for backend services.

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, Vue Router 4, Pinia
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **External APIs**: Free Dictionary API, DeepSeek API (for AI-generated examples)

## Commands

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

### Core Modules

**State Management (src/stores/)**
- `auth.js` - User authentication, session management via localStorage
- `words.js` - Word data, learning progress, SM-2 algorithm implementation, learning plan management

**Key Services (src/utils/)**
- `dictionaryService.js` - Word lookup, DeepSeek API integration for example generation
- `baiduTranslate.js` - Translation service

**Routing (src/router/)**
- Two main route groups: `/admin` (management) and `/student` (learning)
- Role-based access control via route guards

### Database Tables

- `users` - User accounts (username, password, role, daily_limit)
- `words` - Word entries (spelling, meaning, category, created_by)
- `user_word_progress` - Learning progress per user per word (SM-2 parameters)
- `study_logs` - Daily study activity logs
- `user_settings` - User preferences (category, custom_daily_limit)
- `user_learning_plans` - Learning plan assignments (category, daily_limit, priority)

### Key Patterns

**SM-2 Algorithm**: Implemented in `src/stores/words.js:8-48`. Calculates review intervals based on recall quality (0-5 scale).

**Word Source Handling**: Words are tagged as `institution` (teacher-assigned from non-custom categories) or `custom` (user self-imported).

**Learning Plans**: Users can have multiple active learning plans, each with a category and daily limit. Priority determines fetch order.

**RLS Bypass**: Admin operations use `supabaseAdmin` client with service role key to bypass Row Level Security policies.

## Development Notes

- Path alias `@` resolves to `./src`
- Session persistence uses custom localStorage wrapper, not Supabase Auth
- Admin users manage word distribution via `user_learning_plans` table
- When no learning plans exist, fallback to legacy `user_settings.category` logic
