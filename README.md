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

**No API key required!** This project uses the free **Piston API** for code execution, which works on any platform including Vercel, Netlify, etc.

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy! 🚀 (No environment variables needed)

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
│   │   │   └── execute/
│   │   │       └── route.ts        # API route for code execution
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Home page
│   └── components/
│       └── CodeEditor.tsx          # Main editor component
├── temp/                           # Temporary files during execution
├── .github/
│   └── copilot-instructions.md    # Project documentation
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
- ✅ Completely free and open-source
- ✅ No API key required
- ✅ Works on serverless platforms (Vercel, Netlify, etc.)
- ✅ Secure containerized execution
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
