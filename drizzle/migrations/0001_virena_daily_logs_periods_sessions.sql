-- meal slot + date on meal logs
ALTER TABLE public.meal_logs ADD COLUMN IF NOT EXISTS meal_slot text NOT NULL DEFAULT 'meal';
ALTER TABLE public.meal_logs ADD COLUMN IF NOT EXISTS logged_on date NOT NULL DEFAULT CURRENT_DATE;
UPDATE public.meal_logs SET logged_on = (logged_at AT TIME ZONE 'UTC')::date WHERE logged_on IS NOT NULL;
CREATE INDEX IF NOT EXISTS meal_logs_user_day_idx ON public.meal_logs (user_id, logged_on);

-- profiles: does the user track a menstrual cycle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tracks_cycle boolean NOT NULL DEFAULT true;

-- per-day wellbeing log
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  mood text,
  energy int,
  sleep_start text,
  sleep_end text,
  sleep_hours numeric,
  symptoms text[] NOT NULL DEFAULT '{}'::text[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily logs" ON public.daily_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- period days
CREATE TABLE IF NOT EXISTS public.period_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  flow text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.period_days TO authenticated;
GRANT ALL ON public.period_days TO service_role;
ALTER TABLE public.period_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own period days" ON public.period_days
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- single active session per user
CREATE TABLE IF NOT EXISTS public.active_sessions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.active_sessions TO authenticated;
GRANT ALL ON public.active_sessions TO service_role;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own session" ON public.active_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);