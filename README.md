# 🚀 Online Code Compiler & Contest Platform

A comprehensive online code compiler and competitive programming platform built with Next.js and TypeScript. Similar to CodeChef, it supports multiple programming languages with a complete contest management system, user authentication, real-time rankings, and moderation features.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

## 📋 Table of Contents

- [Supported Languages](#-supported-languages)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Core Features](#-core-features)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Security](#-security)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [License](#-license)

## 💻 Supported Languages

- **C** - GCC compiler
- **C++** - G++ compiler  
- **Python** - Python 3 interpreter
- **Java** - OpenJDK
- **JavaScript** - Node.js runtime

## ✨ Key Features

### Code Editor
- 🎨 **Monaco Editor** - VS Code's powerful editor with syntax highlighting
- 🚀 **Real-time Execution** - Instant code compilation and execution
- 📝 **Custom Input** - Support for stdin input
- � **Auto-save** - Code persists across sessions
- 🎯 **Multi-language Support** - Switch between 5 programming languages

### Contest System
- 🏆 **Public & Private Contests** - Create contests with join codes
- ⏰ **Time-based Contests** - Automatic start/end with timezone support
- 📊 **Real-time Rankings** - Live leaderboard with scoring
- 🧪 **Test Cases** - Multiple test cases with hidden tests
- 📈 **Submission Tracking** - Complete submission history
- �️ **Scoring System** - Points based on test cases passed and execution time

### User Management
- 🔐 **Authentication** - Secure JWT-based login/signup
- 👤 **User Profiles** - Personal dashboard with statistics
- 📜 **Submission History** - Track all your submissions
- 🏅 **Rankings** - Global and contest-specific leaderboards

### Admin/Moderator Panel
- 👮 **Contest Moderation** - Review and manage contests
- 📝 **Submission Review** - View all user submissions
- 🎯 **Test Case Management** - Add/edit test cases
- 📊 **Analytics** - Contest statistics and insights
- 🚀 **Results Publishing** - Control when results are visible

## 🛠 Tech Stack

### Frontend
- **[Next.js 14+](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 18](https://react.dev/)** - UI library with hooks
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code's editor component
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless backend functions
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[JWT (Jose)](https://github.com/panva/jose)** - Token-based authentication
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **Autoprefixer** - CSS compatibility
- **PostCSS** - CSS processing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Choose one option:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (free cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Compiler Requirements (for local code execution)
If you want to run code locally instead of using Piston API:
- **GCC/G++** - For C/C++ compilation
- **Python 3** - For Python execution
- **OpenJDK** - For Java compilation
- **Node.js** - For JavaScript execution

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kshitijvaishya/code-editor.git
cd code-editor
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter space issues, try:
```bash
npm cache clean --force
npm install
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# Database will be created automatically at: mongodb://localhost:27017/code-editor
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

📖 Detailed guide: See [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/code-editor
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/code-editor

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
```

**Generate a secure JWT secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any random string (at least 32 characters)
```

### 5. Run Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
code-editor/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (serverless functions)
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/           # POST /api/auth/login
│   │   │   │   ├── logout/          # POST /api/auth/logout
│   │   │   │   ├── signup/          # POST /api/auth/signup
│   │   │   │   └── me/              # GET /api/auth/me
│   │   │   ├── contests/            # Contest management APIs
│   │   │   │   ├── create/          # POST - Create contest
│   │   │   │   ├── join/            # POST - Join contest
│   │   │   │   ├── details/         # GET - Contest details
│   │   │   │   ├── submit/          # POST - Submit solution
│   │   │   │   ├── submissions/     # GET - View submissions
│   │   │   │   ├── publish-results/ # POST - Publish results
│   │   │   │   ├── start/           # POST - Start contest
│   │   │   │   ├── delete/          # DELETE - Delete contest
│   │   │   │   ├── my-contests/     # GET - User's contests
│   │   │   │   └── validate/        # POST - Validate join code
│   │   │   └── execute/             # POST - Execute code
│   │   │       └── route.ts
│   │   ├── contest/                 # Contest pages
│   │   │   └── [id]/               # Dynamic contest page
│   │   │       ├── page.tsx        # Contest view
│   │   │       └── moderate/       # Moderation panel
│   │   │           └── page.tsx
│   │   ├── dashboard/              # User dashboard
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   └── contests/          # Contest listings
│   │   │       └── private/       # Private contests
│   │   ├── editor/                # Code editor page
│   │   │   └── page.tsx
│   │   ├── login/                 # Login page
│   │   │   └── page.tsx
│   │   ├── signup/                # Signup page
│   │   │   └── page.tsx
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Home page
│   ├── components/                 # React components
│   │   ├── CodeEditor.tsx         # Monaco editor wrapper
│   │   ├── ContestCard.tsx        # Contest display card
│   │   ├── CreateContestModal.tsx # Contest creation modal
│   │   ├── JoinContestModal.tsx   # Join contest modal
│   │   ├── JoinCodeSuccessDialog.tsx # Success notification
│   │   ├── Profile.tsx            # User profile component
│   │   └── Sidebar.tsx            # Navigation sidebar
│   ├── lib/                        # Utility libraries
│   │   ├── auth.ts                # Authentication helpers
│   │   ├── contest.ts             # Contest utilities
│   │   ├── contestDb.ts           # Contest database operations
│   │   ├── initDb.ts              # Database initialization
│   │   ├── mongodb.ts             # MongoDB connection client
│   │   ├── problems.ts            # Problem definitions
│   │   ├── testRunner.ts          # Test case execution engine
│   │   ├── timezone.ts            # Timezone utilities
│   │   └── userDb.ts              # User database operations
│   └── middleware.ts               # Auth middleware
├── public/                          # Static assets
├── temp/                            # Temporary execution files
├── .env.local                       # Environment variables (gitignored)
├── .github/
│   └── copilot-instructions.md     # Project guidelines
├── docs/                            # Documentation
│   ├── AUTH_IMPLEMENTATION.md      # Auth system details
│   ├── CONTEST_SYSTEM.md           # Contest features
│   ├── TEST_CASE_SYSTEM.md         # Test case implementation
│   ├── RANKING_SYSTEM.md           # Ranking algorithm
│   ├── MODERATION_PANEL.md         # Moderation features
│   ├── MONGODB_SETUP.md            # Database setup
│   ├── TIMEZONE_IMPLEMENTATION.md  # Timezone handling
│   └── PROJECT_DOCUMENTATION.md    # Complete documentation
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```
## 🎯 Core Features

### 1. Code Editor

**Features:**
- Monaco Editor (VS Code's editor) with IntelliSense
- Syntax highlighting for all supported languages
- Auto-completion and error detection
- Customizable themes (light/dark mode)
- Line numbers and code folding
- Multi-cursor editing

**Usage:**
1. Navigate to `/editor` or use the sidebar
2. Select programming language from dropdown
3. Write your code in the editor
4. Provide input (optional) in the input panel
5. Click "Run Code" to execute
6. View output, errors, and execution time

**Supported Operations:**
```javascript
// Example: Sum of two numbers
Input: 5 10
Output: 15
Execution Time: 0.023s
```

### 2. Authentication System

**Implementation:**
- JWT-based authentication with HTTP-only cookies
- bcryptjs password hashing (10 salt rounds)
- Protected routes with middleware
- Session management with token expiry
- User profile management

**User Flow:**
```
Register → Login → Dashboard → Access Features
```

**API Endpoints:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### 3. Contest System

**Contest Types:**
- **Public Contests** - Open to all registered users
- **Private Contests** - Require 8-character join code

**Contest Lifecycle:**
```
Creation → Registration → Active → Ended → Results Published
```

**Features:**
- Time-based contests with timezone support
- Multiple problems per contest
- Test cases (visible and hidden)
- Real-time submission tracking
- Automatic scoring and ranking
- Contest moderation panel

**Creating a Contest:**
1. Navigate to Dashboard → Create Contest
2. Fill in contest details (title, description, times)
3. Add problems with test cases
4. Set as public or private (with join code)
5. Submit and activate contest

**Joining a Contest:**
1. Navigate to Dashboard
2. Find contest or enter join code
3. Click "Join Contest"
4. Start submitting solutions

### 4. Test Case System

**Test Case Structure:**
```typescript
{
  input: string,           // Test input
  expectedOutput: string,  // Expected result
  isHidden?: boolean      // Hide from participants
}
```

**Execution Flow:**
1. User submits code for a problem
2. Code is compiled (if needed)
3. Each test case is executed
4. Output is compared with expected result
5. Score is calculated based on passed tests
6. Execution time is tracked per test case

**Scoring:**
- Points per test case passed
- Maximum execution time displayed
- Total execution time calculated
- Partial scoring available

**Example:**
```
Problem: Sum of Two Numbers
Test Case 1: Input "5 10" → Output "15" ✓ (0.02s)
Test Case 2: Input "0 0" → Output "0" ✓ (0.01s)
Test Case 3: Input "-5 5" → Output "0" ✓ (0.02s)

Score: 100/100
Max Execution Time: 0.02s
```

### 5. Ranking System

**Ranking Criteria (in order):**
1. **Total Score** - Sum of all problem scores (descending)
2. **Execution Time** - Total time across all submissions (ascending)
3. **Submission Time** - When solution was submitted (ascending)

**Leaderboard Features:**
- Real-time ranking updates
- User position highlighting
- Score breakdown per problem
- Time penalties for multiple attempts (optional)
- Timezone-aware submission times

### 6. Moderation Panel

**Access:** Only contest creator or admin

**Features:**
- View all contest submissions
- Review user code and test results
- Publish/unpublish contest results
- Delete inappropriate submissions
- Modify test cases
- View contest analytics and statistics
- Manage participants

**Location:** `/contest/[id]/moderate`

## 📚 API Documentation

### Authentication APIs

#### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
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
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Contest APIs

#### POST `/api/contests/create`
Create a new contest (requires authentication).

**Request:**
```json
{
  "title": "Weekly Contest #1",
  "description": "Beginner-friendly problems",
  "startTime": "2026-02-15T10:00:00Z",
  "endTime": "2026-02-15T12:00:00Z",
  "problems": [
    {
      "id": "sum-two-numbers",
      "title": "Sum of Two Numbers",
      "description": "Calculate sum of two integers",
      "difficulty": "easy",
      "testCases": [
        {
          "input": "5 10",
          "expectedOutput": "15"
        }
      ]
    }
  ],
  "isPrivate": false
}
```

#### POST `/api/contests/submit`
Submit a solution for a contest problem.

**Request:**
```json
{
  "contestId": "507f1f77bcf86cd799439011",
  "problemId": "sum-two-numbers",
  "code": "#include<stdio.h>\nint main(){...}",
  "language": "c"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "status": "accepted",
    "score": 100,
    "executionTime": 0.023,
    "testResults": [...]
  }
}
```

#### POST `/api/execute`
Execute code with custom input.

**Request:**
```json
{
  "code": "print(input())",
  "language": "python",
  "input": "Hello World"
}
```

**Response:**
```json
{
  "output": "Hello World\n",
  "error": null,
  "executionTime": 0.015
}
```

### Complete API Reference

For detailed API documentation, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Steps:**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set up MongoDB Atlas**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create database user
   - Whitelist all IPs (0.0.0.0/0) for Vercel
   - Copy connection string

3. **Deploy to Vercel**
   - Import repository at [vercel.com](https://vercel.com)
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your secret key (generate secure random string)
     - `NODE_ENV`: `production`
   - Click "Deploy"

4. **Access your app**
   - Your app will be live at `https://your-app.vercel.app`

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### Railway
```bash
# Connect GitHub repository
# Add environment variables
# Deploy automatically
```

#### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t code-compiler .
docker run -p 3000:3000 -e MONGODB_URI="..." -e JWT_SECRET="..." code-compiler
```

### Environment Variables for Production

```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/code-editor

# JWT Secret (Required)
JWT_SECRET=your-secure-random-secret-minimum-32-characters

# Node Environment
NODE_ENV=production

# Optional: Custom Port
PORT=3000
```

## 🧪 Testing

### Manual Testing Guide

#### Test Code Editor
1. Navigate to `/editor`
2. Select each language and test:

**Python Test:**
```python
name = input()
print(f"Hello, {name}!")
```
Input: `World`  
Expected: `Hello, World!`

**C++ Test:**
```cpp
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```
Input: `5 10`  
Expected: `15`

**Java Test:**
```java
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n * 2);
    }
}
```
Input: `7`  
Expected: `14`

#### Test Contest System
1. **Create Contest:** Dashboard → Create Contest → Fill details → Submit
2. **Join Contest:** Enter join code → Verify access
3. **Submit Solution:** Write code → Submit → Check score
4. **View Rankings:** Check leaderboard updates
5. **Moderate:** Access moderation panel (as creator)

#### Test Authentication
- Register with new email
- Login with correct credentials
- Try accessing protected routes without auth
- Logout and verify session cleared

### Automated Testing (Future)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Contest"
```

### Load Testing

Test with multiple concurrent users:
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/execute

# Using Artillery
artillery quick --count 10 -n 20 http://localhost:3000/
```

## 🔒 Security

### Implemented Security Measures

✅ **Authentication**
- JWT tokens with HTTP-only cookies
- Password hashing with bcryptjs (10 salt rounds)
- Protected API routes with middleware
- Session expiry and token refresh

✅ **Database Security**
- MongoDB connection via environment variables
- No credentials in code
- Parameterized queries (prevent injection)
- User data isolation

✅ **Code Execution**
- Sandboxed execution environment
- Timeout limits to prevent infinite loops
- Resource limits (CPU, memory)
- Temporary file cleanup
- Input validation and sanitization

✅ **API Security**
- CORS configuration
- Rate limiting (recommended for production)
- Input validation on all endpoints
- Error handling without exposing internals

### Security Best Practices

**For Production:**
1. **Use Strong JWT Secret**
   ```bash
   # Generate 256-bit secret
   openssl rand -base64 32
   ```

2. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Enforce HTTPS redirects

3. **Implement Rate Limiting**
   ```javascript
   // Recommended: Use express-rate-limit
   const rateLimit = require('express-rate-limit');
   ```

4. **Add CSRF Protection**
   - Implement CSRF tokens for forms
   - Validate origin headers

5. **Regular Updates**
   ```bash
   npm audit
   npm audit fix
   ```

6. **Environment Security**
   - Never commit `.env` files
   - Rotate secrets regularly
   - Use secret management services

### Known Limitations

⚠️ **Code Execution:** Currently uses Piston API (public). For production:
- Consider self-hosting Piston
- Implement additional sandboxing
- Add execution quotas per user

⚠️ **File Upload:** Not implemented. If adding:
- Validate file types and sizes
- Scan for malicious content
- Store in secure location

## 🐛 Troubleshooting

### Common Issues

#### 1. "No space left on device" during npm install
```bash
# Clear npm cache
npm cache clean --force

# Free up disk space
# Delete temporary files and empty recycle bin

# Try again
npm install
```

#### 2. MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Verify connection string
echo $MONGODB_URI

# Test connection
mongosh "mongodb://localhost:27017/code-editor"
```

**Fix for Atlas:**
- Verify credentials in connection string
- Check IP whitelist (add 0.0.0.0/0)
- Ensure database user has read/write permissions

#### 3. JWT Token Invalid/Expired
```bash
# Clear browser cookies
# Or from browser DevTools:
localStorage.clear();
sessionStorage.clear();

# Login again
```

#### 4. Code Execution Timeout
- Check for infinite loops in code
- Increase timeout limit in `lib/testRunner.ts`
- Verify compiler/interpreter is installed

#### 5. Monaco Editor Not Loading
```bash
# Clear browser cache
# Check network tab for CDN errors
# Verify @monaco-editor/react is installed
npm install @monaco-editor/react
```

#### 6. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Debug Mode

Enable detailed logging:
```typescript
// In lib/mongodb.ts
console.log('MongoDB URI:', process.env.MONGODB_URI);

// In API routes
console.log('Request body:', req.body);
console.log('Response:', response);
```

### Getting Help

1. Check [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
2. Review error logs in terminal
3. Check browser console (F12)
4. Search existing GitHub issues
5. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/code-editor.git
   cd code-editor
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make changes**
   - Write clean, documented code
   - Follow TypeScript best practices
   - Test your changes thoroughly

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Describe your changes

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint rules (`npm run lint`)
- Add comments for complex logic
- Update documentation for new features
- Test on multiple browsers
- Ensure mobile responsiveness

### Areas to Contribute

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization
- ♿ Accessibility improvements

## 📚 Documentation

Comprehensive documentation available:

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete project guide
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Database setup instructions
- **[AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)** - Authentication details
- **[CONTEST_SYSTEM.md](CONTEST_SYSTEM.md)** - Contest features guide
- **[TEST_CASE_SYSTEM.md](TEST_CASE_SYSTEM.md)** - Test case implementation
- **[RANKING_SYSTEM.md](RANKING_SYSTEM.md)** - Ranking algorithm
- **[MODERATION_PANEL.md](MODERATION_PANEL.md)** - Moderation features
- **[TIMEZONE_IMPLEMENTATION.md](TIMEZONE_IMPLEMENTATION.md)** - Timezone handling
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide

## 📊 Project Stats

- **Languages:** TypeScript, JavaScript, CSS
- **Framework:** Next.js 14+ with App Router
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Editor:** Monaco Editor
- **Styling:** Tailwind CSS

## 🗺 Roadmap

Future enhancements:

- [ ] Real-time collaborative coding
- [ ] Code sharing and embedding
- [ ] More programming languages (Rust, Go, etc.)
- [ ] Code templates and snippets
- [ ] AI-powered code suggestions
- [ ] Mobile app (React Native)
- [ ] Discord/Slack integration
- [ ] Email notifications for contests
- [ ] Advanced analytics dashboard
- [ ] Team contests and challenges
- [ ] Code plagiarism detection
- [ ] Video tutorials integration

## 📞 Support

For questions or issues:

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/kshitijvaishya/code-editor/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/kshitijvaishya/code-editor/discussions)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework
- **[MongoDB](https://www.mongodb.com/)** - Database
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[Vercel](https://vercel.com/)** - Hosting platform
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework

## 📈 Version History

- **v1.0.0** (Feb 2026) - Initial release
  - Multi-language code editor
  - Contest management system
  - User authentication
  - Real-time rankings
  - Moderation panel

---

<div align="center">

**Built with ❤️ by [Kshitij Vaishya](https://github.com/kshitijvaishya)**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/kshitijvaishya/code-editor/issues) · [Request Feature](https://github.com/kshitijvaishya/code-editor/issues) · [Documentation](PROJECT_DOCUMENTATION.md)

</div>
