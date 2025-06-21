/*
  # Create questions table

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `folder_id` (uuid, required) - Reference to folders table
      - `user_id` (uuid, required) - Reference to auth.users
      - `title` (text, required) - The question text
      - `type` (text, required) - Type of question ('multiple' or 'boolean')
      - `options` (text array, optional) - Multiple choice options
      - `correct_answer` (text, optional) - Correct answer for multiple choice (A, B, C, etc.)
      - `correct_boolean` (boolean, optional) - Correct answer for true/false questions
      - `explanation` (text, optional) - Explanation of the answer
      - `created_at` (timestamp) - When the question was created
      - `updated_at` (timestamp) - When the question was last updated

  2. Security
    - Enable RLS on `questions` table
    - Add policies for authenticated users to manage their own questions
    
  3. Constraints
    - Ensure question type is valid
    - Add foreign key constraints with cascade delete
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple', 'boolean')),
  options text[],
  correct_answer text,
  correct_boolean boolean,
  explanation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own questions
CREATE POLICY "Users can read own questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own questions
CREATE POLICY "Users can insert own questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own questions
CREATE POLICY "Users can update own questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own questions
CREATE POLICY "Users can delete own questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS questions_user_id_idx ON questions(user_id);
CREATE INDEX IF NOT EXISTS questions_folder_id_idx ON questions(folder_id);
CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS questions_type_idx ON questions(type);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at when a question is modified
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();