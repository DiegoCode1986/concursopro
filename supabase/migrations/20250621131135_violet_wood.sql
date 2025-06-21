/*
  # Create folders table

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of the subject/folder
      - `description` (text, optional) - Description of the subject
      - `user_id` (uuid, required) - Reference to auth.users
      - `created_at` (timestamp) - When the folder was created

  2. Security
    - Enable RLS on `folders` table
    - Add policies for authenticated users to manage their own folders
*/

CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own folders
CREATE POLICY "Users can read own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own folders
CREATE POLICY "Users can insert own folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own folders
CREATE POLICY "Users can update own folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own folders
CREATE POLICY "Users can delete own folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON folders(user_id);
CREATE INDEX IF NOT EXISTS folders_created_at_idx ON folders(created_at DESC);