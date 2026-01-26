// Problem Types and Interfaces
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemTopic = 'Arrays' | 'Strings' | 'LinkedList' | 'Trees' | 'Graphs' | 'DP' | 'Greedy' | 'Sorting' | 'Searching' | 'Math' | 'Hashing' | 'Stack' | 'Queue';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  topics: ProblemTopic[];
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  points: number;
}

export interface Submission {
  id: string;
  userId: string;
  username: string;
  contestId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  testsPassed: number;
  totalTests: number;
  submittedAt: string;
  executionTime?: number;
  memory?: number;
  points: number;
}

// Pre-defined DSA Problems
export const DSA_PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Arrays', 'Hashing'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' },
      { input: '[1,5,3,7,9]\n10', expectedOutput: '[1,3]', isHidden: true },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 100
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topics: ['LinkedList'],
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]'
      },
      {
        input: 'head = []',
        output: '[]'
      }
    ],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { input: '[1,2]', expectedOutput: '[2,1]' },
      { input: '[]', expectedOutput: '[]' },
      { input: '[1]', expectedOutput: '[1]', isHidden: true },
      { input: '[1,2,3,4,5,6,7,8,9,10]', expectedOutput: '[10,9,8,7,6,5,4,3,2,1]', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 100
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topics: ['Stack', 'Strings'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    testCases: [
      { input: '()', expectedOutput: 'true' },
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
      { input: '([)]', expectedOutput: 'false' },
      { input: '{[]}', expectedOutput: 'true' },
      { input: '((((((((((', expectedOutput: 'false', isHidden: true },
      { input: '({[()]})', expectedOutput: 'true', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 100
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray Sum',
    difficulty: 'Medium',
    topics: ['Arrays', 'DP'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23'
      }
    ],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' },
      { input: '[-1]', expectedOutput: '-1', isHidden: true },
      { input: '[-2,-1]', expectedOutput: '-1', isHidden: true },
      { input: '[1,2,3,4,5]', expectedOutput: '15', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 200
  },
  {
    id: 'binary-tree-inorder',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    topics: ['Trees', 'Stack'],
    description: `Given the \`root\` of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in this order: Left -> Root -> Right`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100'
    ],
    examples: [
      {
        input: 'root = [1,null,2,3]',
        output: '[1,3,2]'
      },
      {
        input: 'root = []',
        output: '[]'
      },
      {
        input: 'root = [1]',
        output: '[1]'
      }
    ],
    testCases: [
      { input: '[1,null,2,3]', expectedOutput: '[1,3,2]' },
      { input: '[]', expectedOutput: '[]' },
      { input: '[1]', expectedOutput: '[1]' },
      { input: '[1,2,3,4,5]', expectedOutput: '[4,2,5,1,3]', isHidden: true },
      { input: '[5,3,7,2,4,6,8]', expectedOutput: '[2,3,4,5,6,7,8]', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 100
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topics: ['Strings', 'Hashing'],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
      { input: '', expectedOutput: '0', isHidden: true },
      { input: 'au', expectedOutput: '2', isHidden: true },
      { input: 'dvdf', expectedOutput: '3', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 200
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topics: ['Arrays', 'Sorting'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' },
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true },
      { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]', isHidden: true }
    ],
    timeLimit: 3,
    memoryLimit: 256,
    points: 200
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    topics: ['DP'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    examples: [
      {
        input: 'coins = [1,2,5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0'
      }
    ],
    testCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3' },
      { input: '[2]\n3', expectedOutput: '-1' },
      { input: '[1]\n0', expectedOutput: '0' },
      { input: '[1,2,5]\n100', expectedOutput: '20', isHidden: true },
      { input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true }
    ],
    timeLimit: 3,
    memoryLimit: 256,
    points: 250
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'Hard',
    topics: ['Hashing', 'LinkedList'],
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size capacity.
- \`int get(int key)\` Return the value of the key if the key exists, otherwise return -1.
- \`void put(int key, int value)\` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in O(1) average time complexity.`,
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: `LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4`
      }
    ],
    testCases: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]' },
      { input: '["LRUCache","put","get"]\n[[1],[2,1],[2]]', expectedOutput: '[null,null,1]', isHidden: true },
      { input: '["LRUCache","put","put","put","put","get","get"]\n[[2],[2,1],[1,1],[2,3],[4,1],[1],[2]]', expectedOutput: '[null,null,null,null,null,-1,3]', isHidden: true }
    ],
    timeLimit: 5,
    memoryLimit: 512,
    points: 400
  },
  {
    id: 'word-ladder',
    title: 'Word Ladder',
    difficulty: 'Hard',
    topics: ['Graphs', 'Strings'],
    description: `A transformation sequence from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s1 -> s2 -> ... -> sk\` such that:
- Every adjacent pair of words differs by a single letter.
- Every \`si\` for \`1 <= i <= k\` is in \`wordList\`. Note that \`beginWord\` does not need to be in \`wordList\`.
- \`sk == endWord\`

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.`,
    constraints: [
      '1 <= beginWord.length <= 10',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 5000',
      'wordList[i].length == beginWord.length',
      'beginWord, endWord, and wordList[i] consist of lowercase English letters.',
      'beginWord != endWord',
      'All the words in wordList are unique.'
    ],
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
      },
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
        output: '0',
        explanation: 'The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.'
      }
    ],
    testCases: [
      { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5' },
      { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0' },
      { input: 'a\nc\n["a","b","c"]', expectedOutput: '2', isHidden: true }
    ],
    timeLimit: 5,
    memoryLimit: 512,
    points: 400
  }
];

// Get problems by difficulty
export function getProblemsByDifficulty(difficulty: ProblemDifficulty): Problem[] {
  return DSA_PROBLEMS.filter(p => p.difficulty === difficulty);
}

// Get problems by topic
export function getProblemsByTopic(topic: ProblemTopic): Problem[] {
  return DSA_PROBLEMS.filter(p => p.topics.includes(topic));
}

// Get problem by ID
export function getProblemById(id: string): Problem | undefined {
  return DSA_PROBLEMS.find(p => p.id === id);
}

// Get random problems for a contest
export function getRandomProblems(count: number, difficulties?: ProblemDifficulty[]): Problem[] {
  let pool = DSA_PROBLEMS;
  
  if (difficulties && difficulties.length > 0) {
    pool = DSA_PROBLEMS.filter(p => difficulties.includes(p.difficulty));
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
