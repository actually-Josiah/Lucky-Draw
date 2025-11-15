// ✅ NEW CODE: Using RPC for Atomic Increment (Fixes "supabase.literal is not a function")

// 5️⃣ Increment total wins (atomic update using RPC)
const { error: rpcError } = await supabase.rpc('increment_total_wins', {
  user_id_in: winnerPick.user_id,
});

if (rpcError) {
  console.error('Error incrementing total_wins using RPC:', rpcError);
} else {
  console.log(`✅ Total wins incremented via RPC for user ${winnerPick.user_id}`);
}

// 6️⃣ Fetch the updated profile data (Now we perform a separate fetch to get the NEW total_wins)
const { data: profileDetails, error: profileDetailsError } = await supabase
  .from('profiles')
  .select('id, name, phone_number, total_wins')
  .eq('id', winnerPick.user_id)
  .single(); // We use .single() here because the row *must* exist if the RPC succeeded.

if (!profileDetailsError) {
  winnerProfile = profileDetails;
} else {
  console.error('Error fetching updated winner profile:', profileDetailsError);
}