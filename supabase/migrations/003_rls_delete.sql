-- Add explicit DELETE policy to resources table
-- Matches the INSERT/UPDATE policy pattern: authenticated role only
-- Note: With RLS enabled, missing policies deny by default.
-- This policy makes intent explicit and consistent.
CREATE POLICY "Authenticated delete"
  ON resources FOR DELETE
  USING (auth.role() = 'authenticated');
