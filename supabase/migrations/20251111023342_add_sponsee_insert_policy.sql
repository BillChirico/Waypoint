/*
  # Add Sponsee Insert Policy for Relationships

  1. Changes
    - Add new INSERT policy allowing sponsees to create relationships where they are the sponsee
    - This enables the invite code flow where a sponsee can join a sponsor's program
  
  2. Security
    - Policy ensures the authenticated user can only insert themselves as the sponsee
    - Maintains data integrity by preventing users from adding relationships for others
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Sponsees can create relationships for themselves" ON sponsor_sponsee_relationships;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policy for sponsees to create relationships where they are the sponsee
CREATE POLICY "Sponsees can create relationships for themselves"
  ON sponsor_sponsee_relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (sponsee_id = auth.uid());
