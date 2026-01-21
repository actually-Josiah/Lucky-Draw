-- SQL for creating wheel-game-specific functions

-- 1. Create the decrement_wheel_token function
-- This function is specific to the wheel game and includes a check for sufficient tokens.
CREATE OR REPLACE FUNCTION public.decrement_wheel_token(user_id_in UUID)
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
    RAISE EXCEPTION 'Insufficient tokens for wheel game. Please purchase more to play.';
  END IF;

  -- Decrement the token count
  UPDATE public.profiles
  SET available_game_sessions = available_game_sessions - 1
  WHERE id = user_id_in;
END;
$$ LANGUAGE plpgsql;

-- Add a comment for clarity
COMMENT ON FUNCTION public.decrement_wheel_token(UUID) IS 'Atomically decrements the game token count for a given user for the wheel game. Raises an exception if tokens are zero or less.';
