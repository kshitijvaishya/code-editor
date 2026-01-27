# Test Case Validation System

## Overview

This document explains how the contest system validates user code submissions against test cases.

## How It Works

### 1. **Problem Structure**

Each problem in [problems.ts](src/lib/problems.ts) contains:

```typescript
{
  id: 'problem-id',
  title: 'Problem Title',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  testCases: [
    {
      input: 'test input',
      expectedOutput: 'expected output',
      isHidden: false  // Visible to user
    },
    {
      input: 'hidden test input',
      expectedOutput: 'hidden expected output',
      isHidden: true  // Hidden from user
    }
  ],
  timeLimit: 2,  // seconds
  memoryLimit: 256,  // MB
  points: 100
}
```

### 2. **Submission Flow**

When a user submits code in a contest:

```
User submits code
    ↓
POST /api/contests/submit
    ↓
Validate user & contest
    ↓
Run code against ALL test cases (runTestCases)
    ↓
For each test case:
  - Execute code with test input
  - Measure execution time
  - Compare actual output vs expected output
  - Track pass/fail
    ↓
Calculate final status & points
    ↓
Save submission to database
    ↓
Return results (with hidden test cases masked)
```

### 3. **Test Runner** ([testRunner.ts](src/lib/testRunner.ts))

The test runner performs:

#### a) **Code Execution**
- Sends code + test input to `/api/execute`
- Uses Piston API (free code execution service)
- Tracks execution time for each test case

#### b) **Output Comparison**
```typescript
function compareOutputs(actual: string, expected: string): boolean {
  // Normalizes both outputs:
  // - Trim whitespace
  // - Standardize line endings
  // - Remove trailing spaces
  // - Convert to lowercase
  return normalizedActual === normalizedExpected;
}
```

#### c) **Status Determination**
- **Accepted**: All test cases passed
- **Wrong Answer**: Some test cases failed
- **Runtime Error**: Code crashed during execution
- **Compilation Error**: Code failed to compile
- **Time Limit Exceeded**: Execution took longer than time limit

### 4. **Test Case Types**

#### **Public Test Cases** (isHidden: false)
- Visible to users
- Shown in problem examples
- Users can see input, expected output, and their actual output
- Used for debugging

#### **Hidden Test Cases** (isHidden: true)
- Not visible to users
- Used to prevent hardcoding solutions
- Users only see if they passed/failed
- Input/output details are masked: `[Hidden]`

### 5. **Scoring System**

```typescript
// Full points only if ALL test cases pass
if (status === 'Accepted') {
  points = problem.points;  // e.g., 100 or 200
} else {
  points = 0;  // No partial credit
}
```

Currently, there's **no partial scoring**. Future enhancement could add:
```typescript
// Partial scoring (future)
points = (passedTests / totalTests) * problem.points;
```

### 6. **Time Limit Enforcement**

```typescript
// Check execution time for each test case
if (executionTime > timeLimit * 1000) {  // Convert to ms
  status = 'Time Limit Exceeded';
  // Stop running remaining test cases
}
```

### 7. **Example Test Case**

**Problem**: Two Sum

**Test Case 1** (Public):
```
Input: [2,7,11,15]\n9
Expected Output: [0,1]
```

**Test Case 5** (Hidden):
```
Input: [1,5,3,7,9]\n10
Expected Output: [1,3]
isHidden: true
```

**User submits this code**:
```python
# Read input
nums = list(map(int, input().split(',')))
target = int(input())

# Two sum logic
seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print([seen[complement], i])
        break
    seen[num] = i
```

**Execution**:
1. Run against Test Case 1:
   - Input: `[2,7,11,15]\n9`
   - Actual Output: `[0,1]`
   - Expected: `[0,1]`
   - ✅ PASS

2. Run against Test Case 5 (Hidden):
   - Input: `[1,5,3,7,9]\n10`
   - Actual Output: `[1,3]`
   - Expected: `[1,3]`
   - ✅ PASS

**Result**:
```json
{
  "status": "Accepted",
  "testsPassed": 5,
  "totalTests": 5,
  "executionTime": 245,
  "points": 100,
  "testResults": [
    {
      "passed": true,
      "input": "[2,7,11,15]\n9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[0,1]",
      "executionTime": 45
    },
    // ... other public test cases ...
    {
      "passed": true,
      "input": "[Hidden]",
      "expectedOutput": "[Hidden]",
      "actualOutput": "[Hidden]",
      "executionTime": 50,
      "isHidden": true
    }
  ]
}
```

## API Endpoints

### POST /api/execute
Executes code with a single input.

**Request**:
```json
{
  "code": "print('Hello')",
  "language": "python",
  "input": ""
}
```

**Response**:
```json
{
  "success": true,
  "output": "Hello\n",
  "executionTime": 123
}
```

### POST /api/contests/submit
Submits code for a contest problem.

**Request**:
```json
{
  "contestId": "contest-123",
  "problemId": "two-sum",
  "code": "...",
  "language": "python"
}
```

**Response**:
```json
{
  "success": true,
  "submission": {
    "status": "Accepted",
    "testsPassed": 5,
    "totalTests": 5,
    "executionTime": 245,
    "points": 100,
    "testResults": [...]
  }
}
```

## Supported Languages

- **C** (`c`)
- **C++** (`cpp`)
- **Python** (`python`)
- **Java** (`java`)
- **JavaScript** (`javascript`)

## Adding New Problems

1. Add problem to [problems.ts](src/lib/problems.ts):
```typescript
{
  id: 'your-problem',
  title: 'Your Problem',
  difficulty: 'Medium',
  topics: ['Arrays'],
  description: '...',
  testCases: [
    { input: '...', expectedOutput: '...', isHidden: false },
    { input: '...', expectedOutput: '...', isHidden: true },
  ],
  timeLimit: 2,
  memoryLimit: 256,
  points: 200
}
```

2. Include problem in contest via `problemIds`:
```typescript
{
  contestId: 'contest-123',
  problemIds: ['two-sum', 'your-problem'],
  ...
}
```

## Limitations & Future Improvements

### Current Limitations
- No memory limit enforcement (Piston API doesn't provide memory usage)
- No partial scoring
- Sequential test execution (could be parallelized for speed)
- Simple string comparison (doesn't handle multiple valid outputs)

### Planned Improvements
1. **Partial Scoring**: Award points proportional to tests passed
2. **Custom Comparators**: Support problems with multiple valid outputs
3. **Memory Tracking**: Monitor memory usage per test case
4. **Batch Testing**: Run multiple test cases in parallel
5. **Test Case Generation**: Dynamic test case generation for stress testing
6. **Plagiarism Detection**: Compare submissions for similarity
7. **Code Quality Metrics**: Time/space complexity analysis

## Security Considerations

- Code execution is sandboxed via Piston API
- Hidden test cases prevent solution hardcoding
- User code cannot access other submissions or contest data
- Rate limiting should be added to prevent API abuse
