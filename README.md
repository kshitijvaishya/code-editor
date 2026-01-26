# Online Code Compiler

A CodeChef-style online code compiler built with Next.js and TypeScript that supports multiple programming languages.

## Supported Languages

- C
- C++
- Python
- Java
- JavaScript

## Features

- 🎨 Monaco Editor with syntax highlighting
- 🚀 Real-time code execution
- 📝 Custom input support
- 💻 Clean, modern UI similar to CodeChef
- ⚡ Fast compilation and execution
- 🏆 Private Contest System with join codes
- 👤 User Dashboard with Profile and Code Editor
- 🎯 Sidebar navigation for easy access

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (Local installation or MongoDB Atlas account)

**Database:** This project uses MongoDB for storing contest data. See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed setup instructions.

**Code Execution:** Uses the free **Piston API** for code execution, which works on any platform including Vercel, Netlify, etc.

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MongoDB:**
   - For local development: Install MongoDB locally (see [MONGODB_SETUP.md](MONGODB_SETUP.md))
   - For cloud: Create a free MongoDB Atlas cluster (see [MONGODB_SETUP.md](MONGODB_SETUP.md))

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/code-editor
   ```
   Or for MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/code-editor
   ```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Create a MongoDB Atlas cluster (free tier)
3. Import your repository in Vercel
4. Add environment variable in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
5. Deploy! 🚀

## Usage

1. Select your programming language from the dropdown menu
2. Write or paste your code in the editor
3. (Optional) Provide input in the Input panel
4. Click "Run Code" to execute
5. View the output in the Output panel

## Project Structure

```
complier/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contests/            # Contest management APIs
│   │   │   │   ├── create/
│   │   │   │   ├── join/
│   │   │   │   ├── my-contests/
│   │   │   │   └── validate/
│   │   │   └── execute/
│   │   │       └── route.ts         # API route for code execution
│   │   ├── dashboard/               # User dashboard pages
│   │   ├── editor/                  # Code editor page
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/                  # React components
│   │   ├── CodeEditor.tsx
│   │   ├── ContestCard.tsx
│   │   ├── CreateContestModal.tsx
│   │   └── ...
### Code Execution
1. **Frontend**: Monaco Editor provides the code editing interface
2. **API Route**: `/api/execute` sends code to Piston API
3. **Piston**: Free, open-source code execution engine that compiles and runs code in isolated containers
4. **Response**: Output is returned and displayed to the user

### Contest System
1. **Database**: MongoDB stores contest information, join codes, and participants
2. **API Routes**: Handle contest creation, joining, and validation
3. **Real-time Status**: Contest status updates automatically based on start/end times
4. **Join Codes**: 8-character unique codes for private contest accesstions
│       └── contest.ts               # Contest types and utilities
├── temp/                            # Temporary files during execution
├── .env.local                       # Environment variables (not in git)
├── .github/
│   └── copilot-instructions.md     # Project documentation
├── MONGODB_SETUP.md                # MongoDB setup guide
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Frontend**: Monaco Editor provides the code editing interface
2. **API Route**: `/api/execute` sends code to Piston API
3. **Piston**: Free, open-source code execution engine that compiles and runs code in isolated containers
4. **Response**: Output is returned and displayed to the user

**Benefits of Piston:**
- ✅Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Editor**: Monaco Editor (VS Code's editor)
- **Database**: MongoDB (local or Atlas)
- **Code Execution**: Piston API
- **Icons**: Lucide React

## Security Notes

✅ **Production Ready**: Piston provides secure containerized execution
✅ **Database Security**: MongoDB connection secured via environment variables
✅ **No Sensitive Data**: Contest system uses mock user authentication (implement real auth for production)
- ✅ Supports 40+ programming languages
- ✅ No rate limits (public instance)

## Security Notes

✅ **Production Ready**: Piston provides secure containerized execution
✅ **No API Key**: No authentication required
✅ **No Server Required**: Works perfectly on serverless platforms
✅ **Open Source**: Self-host if needed for private use

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
