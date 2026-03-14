-- Add explicit DELETE policy to resources table
-- Matches the INSERT/UPDATE policy pattern: authenticated role only
-- Note: With RLS enabled, missing policies deny by default.
-- This policy makes intent explicit and consistent.
-- Applied to live DB: 2026-03-13 via Supabase Management API (database/query endpoint)
CREATE POLICY "Authenticated delete"
  ON resources FOR DELETE
  USING (auth.role() = 'authenticated');
