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

## Prerequisites

Before running this project, ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **GCC/G++** compiler for C/C++ support
- **Python** (v3.x) for Python support
- **Java JDK** for Java support

### Installing Compilers/Interpreters

#### Windows:
- **GCC/G++**: Install [MinGW](https://sourceforge.net/projects/mingw/) or [TDM-GCC](https://jmeubank.github.io/tdm-gcc/)
- **Python**: Download from [python.org](https://www.python.org/downloads/)
- **Java**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)

#### Linux:
```bash
sudo apt-get update
sudo apt-get install build-essential python3 default-jdk
```

#### macOS:
```bash
brew install gcc python java
```

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

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
2. **API Route**: `/api/execute` handles code compilation and execution
3. **Execution**: Code is written to temporary files, compiled (if needed), executed, and cleaned up
4. **Security**: 5-second timeout on all executions to prevent infinite loops

## Security Notes

⚠️ **Important**: This is a development version. For production use:
- Implement proper sandboxing (Docker containers)
- Add rate limiting
- Validate and sanitize all inputs
- Set resource limits (memory, CPU)
- Implement user authentication
- Add CORS policies

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
