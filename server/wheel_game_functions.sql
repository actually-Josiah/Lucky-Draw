-- SQL for creating the wheel game functions

-- 1. Create the decrement_game_token function
-- This function atomically decrements the user's game tokens.
CREATE OR REPLACE FUNCTION public.decrement_game_token(user_id_in UUID)
RETURNS VOID AS $$
DECLARE
  current_tokens INT;
BEGIN
  -- Select the current number of tokens for the user, with a lock
  SELECT available_game_sessions INTO current_tokens
  FROM public.profiles
  WHERE id = user_id_in
  FOR UPDATE;

  -- Check if the user has enough tokens
  IF current_tokens IS NULL OR current_tokens <= 0 THEN
    RAISE EXCEPTION 'Insufficient tokens. Please purchase more to play.';
  END IF;

  -- Decrement the token count
  UPDATE public.profiles
  SET available_game_sessions = available_game_sessions - 1
  WHERE id = user_id_in;
END;
$$ LANGUAGE plpgsql;

-- Add a comment for clarity
COMMENT ON FUNCTION public.decrement_game_token(UUID) IS 'Atomically decrements the game token count for a given user. Raises an exception if tokens are zero or less.';


-- 2. Create the increment_wins function
-- This function atomically increments the user's total wins.
CREATE OR REPLACE FUNCTION public.increment_wins(user_id_in UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET total_wins = total_wins + 1
  WHERE id = user_id_in;
END;
$$ LANGUAGE plpgsql;

-- Add a comment for clarity
COMMENT ON FUNCTION public.increment_wins(UUID) IS 'Atomically increments the total wins count for a given user.';

-- 3. Create the add_tokens function (from previous work, good to have here)
CREATE OR REPLACE FUNCTION public.add_tokens(user_id_in UUID, tokens_in INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET available_game_sessions = available_game_sessions + tokens_in
  WHERE id = user_id_in;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.add_tokens(UUID, INT) IS 'Atomically adds a specified number of game tokens to a user''s profile.';
