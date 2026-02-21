-- Linguofy Database Schema
-- Run this in your Supabase SQL Editor

-- ==========================================
-- 1. CONTENT TABLES (Managed by Admin)
-- ==========================================

-- Modules (Units)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_index INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
    native_language_ratio DECIMAL(3,2), -- e.g., 0.80 for 80%
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (Songs)
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY, -- e.g. '1-1', '2-3'
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'song', -- song, dialogue, grammar
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'audio_missing', 'published')),
    style_prompt TEXT, -- AI generation prompt
    content JSONB DEFAULT '{}', -- { lyrics_mixed_fr, lyrics_mixed_en, lyrics_pure_es }
    audio_urls JSONB DEFAULT '{}', -- { mixed_fr, mixed_en, pure_es }
    known_vocab TEXT[] DEFAULT '{}', -- vocabulary from previous lessons
    focus_vocab TEXT[] DEFAULT '{}', -- new vocabulary this lesson
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises (Polymorphic)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'fill_blank', 'match_pair', 'translation', 'scramble')),
    -- Core exercise data
    question TEXT NOT NULL,
    question_fr TEXT, -- French translation
    options JSONB, -- ["option1", "option2", ...]
    options_fr JSONB, -- French translations of options
    correct_answer TEXT NOT NULL,
    hint TEXT,
    hint_fr TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. USER TABLES
-- ==========================================

-- Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    native_language TEXT DEFAULT 'en',
    ui_language TEXT DEFAULT 'en', -- for i18n preference
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed',
    score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- PUBLIC: Anyone can read content
CREATE POLICY "Public can read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public can read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public can read exercises" ON exercises FOR SELECT USING (true);

-- AUTHENTICATED: Users can manage their own data
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ADMIN: Full access (use service_role key or custom claim)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
        'admin@linguofy.com',
        'your-email@example.com' -- Replace with your actual email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for content management
CREATE POLICY "Admins can manage modules" ON modules FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage exercises" ON exercises FOR ALL USING (is_admin());

-- ==========================================
-- 4. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);

-- ==========================================
-- 5. TRIGGER: Auto-update updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. SRS (SPACED REPETITION SYSTEM)
-- ==========================================

CREATE TABLE IF NOT EXISTS srs_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    word_es TEXT NOT NULL,
    word_en TEXT NOT NULL,
    interval INTEGER DEFAULT 0, -- Days until next review
    repetition INTEGER DEFAULT 0, -- Times reviewed
    ease_factor DECIMAL(5,2) DEFAULT 2.50, -- SM-2 ease factor
    next_review_date TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_es)
);

ALTER TABLE srs_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own srs items" ON srs_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own srs items" ON srs_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own srs items" ON srs_items FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_srs_items_user ON srs_items(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_items_next_review ON srs_items(next_review_date);
