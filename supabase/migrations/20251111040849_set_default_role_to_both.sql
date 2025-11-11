/*
  # Set Default Role to Both

  ## Overview
  This migration updates all users to have the 'both' role by default, allowing everyone
  to function as both sponsor and sponsee simultaneously.

  ## Changes
  1. Update all existing users who don't have a role set to 'both'
  2. Update all existing users with 'sponsor' or 'sponsee' role to 'both'
  3. Change the default value for new profiles to 'both'

  ## Notes
  - This simplifies the user experience by removing the role selection step
  - All users can now have their own sponsor and also sponsor others
  - No data is lost, just role values are updated
*/

-- Update all existing users to have 'both' role
UPDATE profiles
SET role = 'both'
WHERE role IS NULL OR role IN ('sponsor', 'sponsee');

-- Update the default value for the role column
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'both';
