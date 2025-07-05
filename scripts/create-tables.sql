-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin VARCHAR(7) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  interests TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  company VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status VARCHAR(50) NOT NULL,
  questions_count INTEGER NOT NULL,
  topics TEXT[] NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_problems table
CREATE TABLE IF NOT EXISTS practice_problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  company VARCHAR(100) NOT NULL,
  acceptance_rate DECIMAL(5,2) NOT NULL,
  tags TEXT[] NOT NULL,
  time_complexity VARCHAR(50) NOT NULL,
  space_complexity VARCHAR(50) NOT NULL,
  starter_code TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  solution TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_solutions table
CREATE TABLE IF NOT EXISTS user_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES practice_problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(20) NOT NULL DEFAULT 'javascript',
  status VARCHAR(20) NOT NULL, -- 'solved', 'attempted', 'failed'
  score INTEGER,
  feedback TEXT,
  execution_time INTEGER, -- in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample practice problems
INSERT INTO practice_problems (title, description, difficulty, category, company, acceptance_rate, tags, time_complexity, space_complexity, starter_code, test_cases, solution, explanation) VALUES
('Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'Easy', 'Array', 'Google', 49.1, ARRAY['Array', 'Hash Table'], 'O(n)', 'O(n)', 
'function twoSum(nums, target) {
    // Your code here
}', 
'{"testCases": [{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]}',
'function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}',
'Use a hash map to store numbers and their indices. For each number, check if its complement exists in the map.'
),
('Valid Parentheses', 'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'Easy', 'Stack', 'Microsoft', 40.7, ARRAY['String', 'Stack'], 'O(n)', 'O(n)',
'function isValid(s) {
    // Your code here
}',
'{"testCases": [{"input": {"s": "()"}, "output": true}, {"input": {"s": "()[]{}"}, "output": true}, {"input": {"s": "(]"}, "output": false}]}',
'function isValid(s) {
    const stack = [];
    const map = { ")": "(", "}": "{", "]": "[" };
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}',
'Use a stack to keep track of opening brackets. When encountering a closing bracket, check if it matches the most recent opening bracket.'
);
