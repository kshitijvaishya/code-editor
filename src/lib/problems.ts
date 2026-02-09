// Problem Types and Interfaces
export type ProblemTopic = 'Arrays' | 'Strings' | 'LinkedList' | 'Trees' | 'Graphs' | 'DP' | 'Greedy' | 'Sorting' | 'Searching' | 'Math' | 'Hashing' | 'Stack' | 'Queue';
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

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
    id: 'movie-theater-seating',
    title: 'Movie Theater Seating Arrangement',
    difficulty: 'Easy',
    topics: ['Arrays', 'Strings'],
    description: `We all know that why social distance needed in Covid and therefore in Movie theater there are n seats where people can seat. This seating arrangement is called a good arrangement if:

1. No one can seat adjacent to any person.
2. It isn't possible to seat for any person.

This seating arrangement can be represented as a binary string. If a place is filled it can be represented by 1 and 0 otherwise. Find if the given arrangement is good or not. Print 'Yes' if arrangement is good otherwise 'No'.`,
    constraints: [
      '1 <= t <= 1000',
      '1 <= n <= 10000',
      's consists of only 0s and 1s'
    ],
    examples: [
      {
        input: '5\n10101',
        output: 'Yes',
        explanation: 'No two people (1s) are adjacent, and all available spots are filled optimally.'
      },
      {
        input: '2\n11',
        output: 'No',
        explanation: 'Two people are seated adjacently, violating the social distancing rule.'
      }
    ],
    testCases: [
      { input: '5\n10101', expectedOutput: 'Yes' },
      { input: '2\n11', expectedOutput: 'No' },
      { input: '3\n101', expectedOutput: 'Yes' },
      { input: '4\n1010', expectedOutput: 'Yes', isHidden: true },
      { input: '6\n101010', expectedOutput: 'Yes', isHidden: true },
      { input: '7\n1010101', expectedOutput: 'Yes', isHidden: true },
      { input: '3\n110', expectedOutput: 'No', isHidden: true },
      { input: '1\n1', expectedOutput: 'Yes', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 100
  },
  {
    id: 'credit-card-validation',
    title: 'Validating Credit Card Numbers',
    difficulty: 'Medium',
    topics: ['Strings'],
    description: `You and Fredrick are good friends. Yesterday, Fredrick received credit cards from ABCD Bank. He wants to verify whether his credit card numbers are valid or not. You happen to be great at regex so he is asking for your help!

A valid credit card from ABCD Bank has the following characteristics:

► It must start with a 4, 5 or 6.
► It must contain exactly 16 digits.
► It must only consist of digits (0-9).
► It may have digits in groups of 4, separated by one hyphen "-".
► It must NOT use any other separator like ' ', '_', etc.
► It must NOT have 4 or more consecutive repeated digits.`,
    constraints: [
      '0 < N < 100',
      'Each line contains a potential credit card number'
    ],
    examples: [
      {
        input: '4123456789123456',
        output: 'Valid'
      },
      {
        input: '5123-4567-8912-3456',
        output: 'Valid'
      },
      {
        input: '61234-567-8912-3456',
        output: 'Invalid',
        explanation: 'Card number is not divided into equal groups of 4'
      },
      {
        input: '5133-3367-8912-3456',
        output: 'Invalid',
        explanation: 'Consecutive digits 3333 is repeating 4 times'
      }
    ],
    testCases: [
      { input: '5\n7165863385679329\n6175824393389297\n5252248277877418\n9563584181869815\n5179123424576876', expectedOutput: 'Invalid\nValid\nValid\nInvalid\nValid', isHidden: true },
      { input: '6\n3695-7963-915827-75\n3143-4672-8798-2968-2968\n6444-4444-4444-4918\n6865396515642918\n6865396515642\n4695-7963-9778-2775', expectedOutput: 'Invalid\nInvalid\nInvalid\nValid\nInvalid\nValid', isHidden: true },
      { input: '5\n7165863385679329\n6175824393389297\n5252248277877418\n9563584181869815\n5179123424576876', expectedOutput: 'Invalid\nValid\nValid\nInvalid\nValid', isHidden: true },
      { input: '4\n3695-7963-  5827-75\n4143-4672-8798-2968-2968\n6865---------------3965---------------1564-------------2918\n6865396515642918', expectedOutput: 'Invalid\nInvalid\nInvalid\nValid', isHidden: true }
    ],
    timeLimit: 2,
    memoryLimit: 256,
    points: 200
  },
  {
    id: 'minimum-seminar-halls',
    title: 'Minimum Seminar Halls Required',
    difficulty: 'Medium',
    topics: ['Arrays', 'Greedy', 'Sorting'],
    description: `A college is organizing multiple seminars during a day. Each seminar has a start time and an end time. A seminar hall can host only one seminar at a time.

You are given two arrays:
- start[] — start times of seminars
- end[] — end times of seminars

Both arrays are of size N, where start[i] and end[i] represent the start and end time of the same seminar.

**Task:** Determine the minimum number of seminar halls required so that no two overlapping seminars are scheduled in the same hall.`,
    constraints: [
      '1 ≤ N ≤ 10⁵',
      '0 ≤ start[i] < end[i] ≤ 10⁵'
    ],
    examples: [
      {
        input: 'N = 6\nstart = [1, 3, 0, 5, 8, 5]\nend = [2, 4, 6, 7, 9, 9]',
        output: '3',
        explanation: 'At time 5, three seminars overlap, requiring 3 halls minimum.'
      }
    ],
    testCases: [
      { input: '6\n1 3 0 5 8 5\n2 4 6 7 9 9', expectedOutput: '3' },
      { input: '3\n1 2 3\n4 5 6', expectedOutput: '1' },
      { input: '4\n1 3 2 6\n4 5 8 7', expectedOutput: '3', isHidden: true },
      { input: '5\n0 5 10 15 20\n5 10 15 20 25', expectedOutput: '1', isHidden: true }
    ],
    timeLimit: 3,
    memoryLimit: 256,
    points: 250
  },
  {
    id: 'almost-equal',
    title: 'Almost Equal',
    difficulty: 'Medium',
    topics: ['Arrays', 'Sorting', 'Searching'],
    description: `A Sumo wrestling championship is scheduled to be held this winter in the HackerCity where N wrestlers from different parts of the world are going to participate. The rules state that two wrestlers can fight against each other if and only if the difference in their height is less than or equal to K.

(i.e) wrestler A and wrestler B can fight if and only if |height(A) - height(B)| <= K.

Given an array H[], where H[i] represents the height of the ith fighter, for a given l, r where 0 <= l <= r < N, can you count the number of pairs of fighters between l and r (both inclusive) who qualify to play a game?`,
    constraints: [
      '1 <= N <= 100000',
      '0 <= K <= 10⁹',
      '0 <= H[i] <= 10⁹',
      '1 <= Q <= 100000',
      '0 <= l <= r < N'
    ],
    examples: [
      {
        input: 'N = 5, K = 2\nH = [1, 3, 4, 3, 0]\nQuery: l = 0, r = 1',
        output: '1',
        explanation: 'Between indices 0 and 1 we have pair (0,1) and |H[0]-H[1]|=2, therefore output is 1.'
      },
      {
        input: 'N = 5, K = 2\nH = [1, 3, 4, 3, 0]\nQuery: l = 1, r = 3',
        output: '3',
        explanation: 'The pairs (H[1],H[2]) (H[1],H[3]) and (H[2],H[3]) satisfy |H[i]-H[j]| <= 2. Hence output is 3.'
      },
      {
        input: 'N = 5, K = 2\nH = [1, 3, 4, 3, 0]\nQuery: l = 0, r = 4',
        output: '6',
        explanation: 'Apart from those in previous query, we have (H[0],H[1]), (H[0], H[3]), (H[0], H[4]), hence 6.'
      }
    ],
    testCases: [
      { input: '5 2\n1 3 4 3 0\n3\n0 1\n1 3\n0 4', expectedOutput: '1\n3\n6' },
      { input: '4 1\n5 6 7 8\n2\n0 3\n1 2', expectedOutput: '3\n1' },
      { input: '6 3\n10 15 12 18 20 14\n4\n0 2\n1 4\n0 5\n2 5', expectedOutput: '2\n5\n9\n5', isHidden: true }
    ],
    timeLimit: 3,
    memoryLimit: 512,
    points: 300
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
