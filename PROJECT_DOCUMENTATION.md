# Online Code Compiler - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Authentication System](#authentication-system)
6. [Contest System](#contest-system)
7. [Test Case System](#test-case-system)
8. [Code Execution](#code-execution)
9. [Ranking & Scoring](#ranking--scoring)
10. [Moderation Panel](#moderation-panel)
11. [Database Schema](#database-schema)
12. [API Endpoints](#api-endpoints)
13. [Testing Guide](#testing-guide)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This is an online code compiler platform similar to CodeChef that allows users to write, compile, and execute code in multiple programming languages. It includes a complete contest management system with authentication, test cases, rankings, and moderation features.

### Supported Languages
- **C** - GCC compiler
- **C++** - G++ compiler
- **Python** - Python 3 interpreter
- **Java** - OpenJDK
- **JavaScript** - Node.js runtime

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **Monaco Editor** - Code editor (VS Code editor)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **JWT (Jose)** - Authentication tokens
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Autoprefixer** - CSS compatibility

---

## ✨ Features

### User Features
- ✅ User registration and login
- ✅ Code editor with syntax highlighting
- ✅ Multi-language code execution
- ✅ Real-time code compilation and output
- ✅ Contest participation
- ✅ Submission history
- ✅ User rankings and leaderboards
- ✅ Profile management
- ✅ Timezone support

### Contest Features
- ✅ Create public/private contests
- ✅ Set start and end times
- ✅ Add multiple problems with test cases
- ✅ Join code for private contests
- ✅ Automatic scoring and ranking
- ✅ Contest validation and rules
- ✅ Results publication
- ✅ Submission tracking

### Admin/Moderator Features
- ✅ Contest moderation panel
- ✅ User management
- ✅ Test case management
- ✅ Submission review
- ✅ Results publishing
- ✅ Contest analytics

---

## 🏗 Architecture

### Directory Structure
```
code-editor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── contests/     # Contest management
│   │   │   └── execute/      # Code execution
│   │   ├── contest/          # Contest pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── editor/           # Code editor page
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── components/           # React components
│   │   ├── CodeEditor.tsx   # Monaco editor wrapper
│   │   ├── ContestCard.tsx  # Contest display
│   │   ├── CreateContestModal.tsx
│   │   ├── JoinContestModal.tsx
│   │   ├── Profile.tsx      # User profile
│   │   └── Sidebar.tsx      # Navigation
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # Auth helpers
│   │   ├── contest.ts       # Contest logic
│   │   ├── contestDb.ts     # Contest DB operations
│   │   ├── initDb.ts        # DB initialization
│   │   ├── mongodb.ts       # MongoDB connection
│   │   ├── problems.ts      # Problem definitions
│   │   ├── testRunner.ts    # Test execution
│   │   ├── timezone.ts      # Timezone utilities
│   │   └── userDb.ts        # User DB operations
│   └── middleware.ts         # Auth middleware
├── public/                   # Static assets
└── temp/                     # Temporary execution files
```

### Data Flow
1. **User Request** → Next.js App Router
2. **Middleware** → JWT validation
3. **API Route** → Business logic
4. **Database** → MongoDB operations
5. **Response** → JSON back to client

---

## 🔐 Authentication System

### Implementation
- **JWT tokens** stored in HTTP-only cookies
- **bcryptjs** for password hashing (10 salt rounds)
- **Middleware** protection for authenticated routes
- **Session management** with token expiry

### API Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

#### POST `/api/auth/logout`
Clear authentication token.

#### GET `/api/auth/me`
Get current user information.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "date"
  }
}
```

---

## 🏆 Contest System

### Contest Types
- **Public Contests** - Open to all users
- **Private Contests** - Requires join code

### Contest Lifecycle
1. **Creation** - Admin creates contest with problems
2. **Registration** - Users join contest
3. **Active** - Users submit solutions
4. **Ended** - Submissions closed
5. **Results Published** - Rankings revealed

### Contest Properties
- **Title** and **Description**
- **Start Time** and **End Time** (with timezone support)
- **Problems** with test cases
- **Join Code** (for private contests)
- **Participants** list
- **Submissions** tracking
- **Rankings** with scores

### API Endpoints

#### POST `/api/contests/create`
Create a new contest.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "startTime": "ISO date string",
  "endTime": "ISO date string",
  "problems": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "difficulty": "easy|medium|hard",
      "testCases": [
        {
          "input": "string",
          "expectedOutput": "string"
        }
      ]
    }
  ],
  "isPrivate": "boolean",
  "joinCode": "string (optional)"
}
```

#### POST `/api/contests/join`
Join a contest with join code.

**Request Body:**
```json
{
  "contestId": "string",
  "joinCode": "string"
}
```

#### GET `/api/contests/details?id={contestId}`
Get contest details.

#### POST `/api/contests/submit`
Submit a solution for a problem.

**Request Body:**
```json
{
  "contestId": "string",
  "problemId": "string",
  "code": "string",
  "language": "c|cpp|python|java|javascript"
}
```

#### GET `/api/contests/submissions?contestId={id}`
Get all submissions for a contest.

#### POST `/api/contests/publish-results`
Publish contest results and rankings.

#### POST `/api/contests/start`
Manually start a contest.

#### DELETE `/api/contests/delete`
Delete a contest.

---

## 🧪 Test Case System

### Test Case Structure
```typescript
interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;  // Hidden test cases for security
}
```

### Test Execution Flow
1. **Code Submission** - User submits code
2. **Compilation** - Code compiled (if needed)
3. **Test Execution** - Run against all test cases
4. **Output Comparison** - Compare actual vs expected
5. **Scoring** - Calculate score based on passed tests

### Execution Time Tracking
- **Per Test Case** - Individual execution time tracked
- **Maximum Time** - Display the longest execution time
- **Time Limit** - Enforce maximum execution time per test
- **Total Time** - Sum of all test case execution times

### Test Runner (`lib/testRunner.ts`)
```typescript
async function runTests(code: string, language: string, testCases: TestCase[]) {
  // Compile code (if needed)
  // Run each test case
  // Track execution time
  // Compare outputs
  // Return results
}
```

---

## ⚙️ Code Execution

### Execution Process
1. **Create temp file** with user code
2. **Compile** (for C/C++/Java)
3. **Execute** with input
4. **Capture output** and errors
5. **Cleanup** temp files
6. **Return results**

### Language Configurations

#### C
```bash
gcc temp.c -o temp.exe
temp.exe < input.txt
```

#### C++
```bash
g++ temp.cpp -o temp.exe
temp.exe < input.txt
```

#### Python
```bash
python temp.py < input.txt
```

#### Java
```bash
javac Temp.java
java Temp < input.txt
```

#### JavaScript
```bash
node temp.js < input.txt
```

### Security Measures
- **Sandboxed execution** in temp directory
- **File cleanup** after execution
- **Timeout enforcement** to prevent infinite loops
- **Resource limits** (memory, CPU)
- **Input validation** to prevent injection

### API Endpoint

#### POST `/api/execute/route`
Execute code and return output.

**Request Body:**
```json
{
  "code": "string",
  "language": "c|cpp|python|java|javascript",
  "input": "string (optional)"
}
```

**Response:**
```json
{
  "output": "string",
  "error": "string (if any)",
  "executionTime": "number (ms)"
}
```

---

## 📊 Ranking & Scoring

### Scoring System
- **Test Case Points** - Points per passed test case
- **Time Bonus** - Faster submissions get bonus points
- **Penalty** - Wrong submissions may incur penalties
- **Total Score** - Sum of all problem scores

### Ranking Algorithm
1. **Primary Sort** - By total score (descending)
2. **Tie Breaker 1** - By total execution time (ascending)
3. **Tie Breaker 2** - By submission time (ascending)

### Leaderboard
- Real-time ranking updates
- User position and score
- Top performers highlighted
- Timezone-aware timestamps

---

## 👮 Moderation Panel

### Moderator Capabilities
- View all contest submissions
- Review user code
- Publish or unpublish results
- Delete inappropriate contests
- Manage test cases
- View analytics

### Access Control
- Only contest creator or admin can moderate
- Protected routes with JWT verification
- Role-based permissions

### Moderation Page
Located at: `/contest/[id]/moderate`

---

## 🗄 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (hashed),
  createdAt: Date,
  role?: 'user' | 'admin'
}
```

### Contests Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  createdBy: ObjectId (User),
  startTime: Date,
  endTime: Date,
  problems: [
    {
      id: string,
      title: string,
      description: string,
      difficulty: string,
      testCases: [
        {
          input: string,
          expectedOutput: string,
          isHidden?: boolean
        }
      ]
    }
  ],
  isPrivate: boolean,
  joinCode?: string,
  participants: [ObjectId],
  isActive: boolean,
  resultsPublished: boolean,
  createdAt: Date
}
```

### Submissions Collection
```typescript
{
  _id: ObjectId,
  contestId: ObjectId,
  problemId: string,
  userId: ObjectId,
  code: string,
  language: string,
  status: 'accepted' | 'wrong_answer' | 'error' | 'timeout',
  score: number,
  executionTime: number,
  testResults: [
    {
      passed: boolean,
      input: string,
      expectedOutput: string,
      actualOutput: string,
      executionTime: number
    }
  ],
  submittedAt: Date
}
```

---

## 🔌 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Contests
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contests/create` | Create contest | Yes |
| POST | `/api/contests/join` | Join contest | Yes |
| GET | `/api/contests/details` | Get contest info | Yes |
| POST | `/api/contests/submit` | Submit solution | Yes |
| GET | `/api/contests/submissions` | Get submissions | Yes |
| POST | `/api/contests/publish-results` | Publish results | Yes (Creator) |
| POST | `/api/contests/start` | Start contest | Yes (Creator) |
| DELETE | `/api/contests/delete` | Delete contest | Yes (Creator) |
| GET | `/api/contests/my-contests` | Get user's contests | Yes |
| POST | `/api/contests/validate` | Validate join code | Yes |

### Code Execution
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/execute` | Execute code | Optional |

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication Tests
- [ ] Register new user with valid credentials
- [ ] Try to register with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected routes without login (should redirect)
- [ ] Logout successfully

#### Code Execution Tests

**Test 1: Hello World**
```python
# Python
print("Hello, World!")
```
Expected Output: `Hello, World!`

**Test 2: Input/Output**
```python
# Python
name = input()
print(f"Hello, {name}!")
```
Input: `Alice`
Expected Output: `Hello, Alice!`

**Test 3: Multiple Test Cases**
```cpp
// C++
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```
Test Cases:
- Input: `2 3` → Output: `5`
- Input: `10 20` → Output: `30`
- Input: `-5 5` → Output: `0`

#### Contest Tests
- [ ] Create a public contest
- [ ] Create a private contest with join code
- [ ] Join a contest
- [ ] Submit solution to contest problem
- [ ] View contest leaderboard
- [ ] Check rankings after submission
- [ ] Publish results as contest creator
- [ ] Delete contest

#### Edge Cases
- [ ] Submit empty code
- [ ] Submit code with syntax errors
- [ ] Submit code with infinite loop (should timeout)
- [ ] Submit very long output (should truncate)
- [ ] Join contest with wrong code
- [ ] Submit after contest ends (should fail)

### Automated Testing

#### Unit Tests (Future Implementation)
```bash
npm test
```

#### Integration Tests
- Test API endpoints with Postman or similar
- Test database operations
- Test authentication flow

#### Performance Tests
- Load testing with multiple simultaneous users
- Code execution performance benchmarks
- Database query optimization

### Test Data

#### Sample Problems

**Problem 1: Sum of Two Numbers**
```
Input: Two integers a and b
Output: Sum of a and b

Test Cases:
1. Input: 5 10 → Output: 15
2. Input: -3 7 → Output: 4
3. Input: 0 0 → Output: 0
```

**Problem 2: Reverse String**
```
Input: A string
Output: Reversed string

Test Cases:
1. Input: "hello" → Output: "olleh"
2. Input: "12345" → Output: "54321"
3. Input: "a" → Output: "a"
```

**Problem 3: Factorial**
```
Input: Integer n
Output: Factorial of n

Test Cases:
1. Input: 5 → Output: 120
2. Input: 0 → Output: 1
3. Input: 1 → Output: 1
```

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or cloud)
- Compiler tools installed:
  - GCC/G++ for C/C++
  - Python 3
  - OpenJDK for Java
  - Node.js for JavaScript

### Environment Variables
Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/code-compiler
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Installation Steps
```bash
# 1. Clone repository
git clone <repository-url>
cd code-editor

# 2. Install dependencies
npm install

# 3. Setup MongoDB
# Make sure MongoDB is running

# 4. Build the project
npm run build

# 5. Start production server
npm start
```

### Development Mode
```bash
npm run dev
```

### Production Deployment

#### Vercel
```bash
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "No space left on device" during npm install
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Free up disk space
# Delete temporary files, empty recycle bin
```

#### Issue: MongoDB connection failed
**Solution:**
- Check if MongoDB is running
- Verify MONGODB_URI in environment variables
- Check network connectivity

#### Issue: Code execution timeout
**Solution:**
- Check for infinite loops in submitted code
- Increase timeout limit in testRunner.ts
- Optimize code execution environment

#### Issue: JWT token invalid
**Solution:**
- Clear browser cookies
- Login again
- Check JWT_SECRET in environment variables

#### Issue: Monaco Editor not loading
**Solution:**
- Check internet connection (CDN)
- Clear browser cache
- Verify @monaco-editor/react installation

### Debug Mode
Enable debug logging:
```typescript
// Add to lib/mongodb.ts
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Add to api routes
console.log('Request:', req.body);
console.log('Response:', response);
```

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use async/await for asynchronous operations
- Add proper error handling
- Comment complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### Component Structure
```tsx
// Use functional components with hooks
import { useState, useEffect } from 'react';

export default function Component() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [JWT Guide](https://jwt.io/introduction)

### Related Files
- `AUTH_IMPLEMENTATION.md` - Authentication details
- `CONTEST_SYSTEM.md` - Contest system documentation
- `TEST_CASE_SYSTEM.md` - Test case implementation
- `RANKING_SYSTEM.md` - Ranking algorithm details
- `MODERATION_PANEL.md` - Moderation features
- `TIMEZONE_IMPLEMENTATION.md` - Timezone handling
- `MONGODB_SETUP.md` - Database setup guide
- `QUICKSTART.md` - Quick start guide

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

## 📄 License

This project is private and proprietary.

---

## 🎉 Credits

Built with ❤️ using Next.js, TypeScript, and MongoDB.

Last Updated: February 10, 2026
