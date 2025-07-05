-- Insert more practice problems across different categories

-- Array Problems
INSERT INTO practice_problems (title, description, difficulty, category, company, acceptance_rate, tags, time_complexity, space_complexity, starter_code, test_cases, solution, explanation) VALUES
('Maximum Subarray', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'Medium', 'Array', 'Amazon', 54.5, ARRAY['Array', 'Dynamic Programming', 'Divide and Conquer'], 'O(n)', 'O(1)', 
'function maxSubArray(nums) {
    // Your code here
}', 
'{"testCases": [{"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6}, {"input": {"nums": [1]}, "output": 1}, {"input": {"nums": [5,4,-1,7,8]}, "output": 23}]}',
'function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}',
'Use Kadane''s algorithm to find the maximum sum subarray in linear time.'
),

('3Sum', 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.', 'Medium', 'Array', 'Meta', 32.1, ARRAY['Array', 'Two Pointers', 'Sorting'], 'O(n²)', 'O(1)', 
'function threeSum(nums) {
    // Your code here
}', 
'{"testCases": [{"input": {"nums": [-1,0,1,2,-1,-4]}, "output": [[-1,-1,2],[-1,0,1]]}, {"input": {"nums": [0,1,1]}, "output": []}, {"input": {"nums": [0,0,0]}, "output": [[0,0,0]]}]}',
'function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return result;
}',
'Sort the array and use two pointers technique to find triplets that sum to zero.'
),

-- String Problems
('Longest Palindromic Substring', 'Given a string s, return the longest palindromic substring in s.', 'Medium', 'String', 'Apple', 32.8, ARRAY['String', 'Dynamic Programming'], 'O(n²)', 'O(1)', 
'function longestPalindrome(s) {
    // Your code here
}', 
'{"testCases": [{"input": {"s": "babad"}, "output": "bab"}, {"input": {"s": "cbbd"}, "output": "bb"}, {"input": {"s": "a"}, "output": "a"}]}',
'function longestPalindrome(s) {
    if (!s || s.length < 2) return s;
    let start = 0, maxLen = 1;
    
    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            const currentLen = right - left + 1;
            if (currentLen > maxLen) {
                start = left;
                maxLen = currentLen;
            }
            left--; right++;
        }
    }
    
    for (let i = 0; i < s.length; i++) {
        expandAroundCenter(i, i);
        expandAroundCenter(i, i + 1);
    }
    
    return s.substring(start, start + maxLen);
}',
'Expand around each possible center to find the longest palindrome.'
),

('Group Anagrams', 'Given an array of strings strs, group the anagrams together.', 'Medium', 'String', 'Google', 67.3, ARRAY['Array', 'Hash Table', 'String', 'Sorting'], 'O(n*k*log(k))', 'O(n*k)', 
'function groupAnagrams(strs) {
    // Your code here
}', 
'{"testCases": [{"input": {"strs": ["eat","tea","tan","ate","nat","bat"]}, "output": [["bat"],["nat","tan"],["ate","eat","tea"]]}, {"input": {"strs": [""]}, "output": [[""]]}, {"input": {"strs": ["a"]}, "output": [["a"]]}]}',
'function groupAnagrams(strs) {
    const map = new Map();
    for (const str of strs) {
        const key = str.split("").sort().join("");
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(str);
    }
    return Array.from(map.values());
}',
'Sort each string to create a key and group strings with the same sorted key.'
),

-- Tree Problems
('Binary Tree Inorder Traversal', 'Given the root of a binary tree, return the inorder traversal of its nodes values.', 'Easy', 'Tree', 'Netflix', 74.4, ARRAY['Stack', 'Tree', 'Depth-First Search', 'Binary Tree'], 'O(n)', 'O(n)', 
'function inorderTraversal(root) {
    // Your code here
}', 
'{"testCases": [{"input": {"root": [1,null,2,3]}, "output": [1,3,2]}, {"input": {"root": []}, "output": []}, {"input": {"root": [1]}, "output": [1]}]}',
'function inorderTraversal(root) {
    const result = [];
    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    inorder(root);
    return result;
}',
'Use recursive approach: left subtree, root, right subtree.'
),

('Maximum Depth of Binary Tree', 'Given the root of a binary tree, return its maximum depth.', 'Easy', 'Tree', 'Microsoft', 73.7, ARRAY['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'], 'O(n)', 'O(n)', 
'function maxDepth(root) {
    // Your code here
}', 
'{"testCases": [{"input": {"root": [3,9,20,null,null,15,7]}, "output": 3}, {"input": {"root": [1,null,2]}, "output": 2}, {"input": {"root": []}, "output": 0}]}',
'function maxDepth(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}',
'Recursively find the maximum depth of left and right subtrees.'
),

-- Dynamic Programming Problems
('Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', 'Easy', 'Dynamic Programming', 'Amazon', 52.1, ARRAY['Math', 'Dynamic Programming', 'Memoization'], 'O(n)', 'O(1)', 
'function climbStairs(n) {
    // Your code here
}', 
'{"testCases": [{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}, {"input": {"n": 4}, "output": 5}]}',
'function climbStairs(n) {
    if (n <= 2) return n;
    let prev2 = 1, prev1 = 2;
    for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}',
'Use dynamic programming with space optimization. Each step can be reached from previous 1 or 2 steps.'
),

('House Robber', 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected.', 'Medium', 'Dynamic Programming', 'Google', 49.5, ARRAY['Array', 'Dynamic Programming'], 'O(n)', 'O(1)', 
'function rob(nums) {
    // Your code here
}', 
'{"testCases": [{"input": {"nums": [1,2,3,1]}, "output": 4}, {"input": {"nums": [2,7,9,3,1]}, "output": 12}, {"input": {"nums": [2,1,1,2]}, "output": 4}]}',
'function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    let prev2 = nums[0];
    let prev1 = Math.max(nums[0], nums[1]);
    for (let i = 2; i < nums.length; i++) {
        const current = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}',
'For each house, decide whether to rob it or not based on maximum profit.'
),

-- Graph Problems
('Number of Islands', 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.', 'Medium', 'Graph', 'Meta', 57.2, ARRAY['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'], 'O(m*n)', 'O(m*n)', 
'function numIslands(grid) {
    // Your code here
}', 
'{"testCases": [{"input": {"grid": [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]}, "output": 1}, {"input": {"grid": [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]}, "output": 3}]}',
'function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    let count = 0;
    
    function dfs(i, j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === "0") return;
        grid[i][j] = "0";
        dfs(i + 1, j);
        dfs(i - 1, j);
        dfs(i, j + 1);
        dfs(i, j - 1);
    }
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === "1") {
                count++;
                dfs(i, j);
            }
        }
    }
    return count;
}',
'Use DFS to mark all connected land cells and count the number of islands.'
),

-- Linked List Problems
('Reverse Linked List', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'Easy', 'Linked List', 'Apple', 73.1, ARRAY['Linked List', 'Recursion'], 'O(n)', 'O(1)', 
'function reverseList(head) {
    // Your code here
}', 
'{"testCases": [{"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]}, {"input": {"head": [1,2]}, "output": [2,1]}, {"input": {"head": []}, "output": []}]}',
'function reverseList(head) {
    let prev = null;
    let current = head;
    while (current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}',
'Use three pointers to reverse the links iteratively.'
),

-- Queue Problems
('Implement Queue using Stacks', 'Implement a first in first out (FIFO) queue using only two stacks.', 'Easy', 'Queue', 'Microsoft', 63.2, ARRAY['Stack', 'Design', 'Queue'], 'O(1) amortized', 'O(n)', 
'class MyQueue {
    constructor() {
        // Your code here
    }
    
    push(x) {
        // Your code here
    }
    
    pop() {
        // Your code here
    }
    
    peek() {
        // Your code here
    }
    
    empty() {
        // Your code here
    }
}', 
'{"testCases": [{"input": {"operations": ["MyQueue", "push", "push", "peek", "pop", "empty"], "values": [[], [1], [2], [], [], []]}, "output": [null, null, null, 1, 1, false]}]}',
'class MyQueue {
    constructor() {
        this.stack1 = [];
        this.stack2 = [];
    }
    
    push(x) {
        this.stack1.push(x);
    }
    
    pop() {
        this.peek();
        return this.stack2.pop();
    }
    
    peek() {
        if (this.stack2.length === 0) {
            while (this.stack1.length > 0) {
                this.stack2.push(this.stack1.pop());
            }
        }
        return this.stack2[this.stack2.length - 1];
    }
    
    empty() {
        return this.stack1.length === 0 && this.stack2.length === 0;
    }
}',
'Use two stacks: one for input, one for output. Transfer elements when needed.'
);
