-- SQL for creating the wheel game schema

-- 1. Create the wheel_prizes table
-- This table stores the list of all possible prizes for the spin wheel.
CREATE TABLE IF NOT EXISTS public.wheel_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT, -- URL to the prize image for the wheel
    probability FLOAT NOT NULL CHECK (probability >= 0 AND probability <= 1)
);

-- Add comments for clarity
COMMENT ON TABLE public.wheel_prizes IS 'Stores the prizes for the spin the wheel game, along with their win probabilities.';
COMMENT ON COLUMN public.wheel_prizes.name IS 'The display name of the prize.';
COMMENT ON COLUMN public.wheel_prizes.image_url IS 'An optional URL to an image for the prize, to be displayed on the frontend wheel.';
COMMENT ON COLUMN public.wheel_prizes.probability IS 'The probability of winning this prize, a value between 0 and 1.';

-- Enable Row Level Security
ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to the prizes, as the frontend needs this.
CREATE POLICY "Allow public read access to wheel prizes"
ON public.wheel_prizes
FOR SELECT
USING (true);


-- 2. Create the wheel_game_spins table
-- This table logs every spin action for historical and analytical purposes.
CREATE TABLE IF NOT EXISTS public.wheel_game_spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES public.wheel_prizes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.wheel_game_spins IS 'Logs every spin action taken by a user.';
COMMENT ON COLUMN public.wheel_game_spins.user_id IS 'The user who performed the spin.';
COMMENT ON COLUMN public.wheel_game_spins.prize_id IS 'The prize that was won. References wheel_prizes.id.';

-- Enable Row Level Security
ALTER TABLE public.wheel_game_spins ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see their own spins.
CREATE POLICY "Allow users to see their own spins"
ON public.wheel_game_spins
FOR SELECT
USING (auth.uid() = user_id);


-- 3. Insert sample prize data
-- The sum of probabilities MUST equal 1.0 for the weighted draw to be accurate.
-- You can adjust these values as needed.
TRUNCATE public.wheel_prizes RESTART IDENTITY CASCADE; -- Clear existing prizes before inserting new ones
INSERT INTO public.wheel_prizes (name, probability) VALUES
    ('MacBook Pro', 0.001),                -- 0.1%
    ('iPhone 15', 0.005),                  -- 0.5%
    ('PlayStation 5', 0.009),              -- 0.9%
    ('$50 Amazon Gift Card', 0.02),      -- 2%
    ('AirPods Pro', 0.03),                 -- 3%
    ('$10 Starbucks Card', 0.05),          -- 5%
    ('Netflix Subscription (1 month)', 0.085), -- 8.5%
    ('No Prize', 0.8);                     -- 80%

-- Verification Note:
-- Sum of probabilities: 0.001 + 0.005 + 0.009 + 0.02 + 0.03 + 0.05 + 0.085 + 0.8 = 1.0
