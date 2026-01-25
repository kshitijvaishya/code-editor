import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { promisify } from 'util';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

type Language = 'c' | 'cpp' | 'python' | 'java' | 'javascript';

interface ExecuteRequest {
  language: Language;
  code: string;
  input?: string;
}

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), 'temp');

async function ensureTempDir() {
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }
}

async function executeC(code: string, input: string): Promise<string> {
  await ensureTempDir();
  const fileName = `temp_${Date.now()}`;
  const sourceFile = path.join(tempDir, `${fileName}.c`);
  const outputFile = path.join(tempDir, `${fileName}.exe`);
  const inputFile = path.join(tempDir, `${fileName}_input.txt`);

  try {
    await writeFile(sourceFile, code);
    if (input) await writeFile(inputFile, input);

    // Compile
    await execAsync(`gcc "${sourceFile}" -o "${outputFile}"`);

    // Execute
    const executeCommand = input
      ? `"${outputFile}" < "${inputFile}"`
      : `"${outputFile}"`;
    
    const { stdout, stderr } = await execAsync(executeCommand, { timeout: 5000 });
    
    return stderr ? `${stdout}\n${stderr}` : stdout;
  } finally {
    // Cleanup
    await Promise.allSettled([
      unlink(sourceFile),
      unlink(outputFile),
      input ? unlink(inputFile) : Promise.resolve(),
    ]);
  }
}

async function executeCpp(code: string, input: string): Promise<string> {
  await ensureTempDir();
  const fileName = `temp_${Date.now()}`;
  const sourceFile = path.join(tempDir, `${fileName}.cpp`);
  const outputFile = path.join(tempDir, `${fileName}.exe`);
  const inputFile = path.join(tempDir, `${fileName}_input.txt`);

  try {
    await writeFile(sourceFile, code);
    if (input) await writeFile(inputFile, input);

    // Compile
    await execAsync(`g++ "${sourceFile}" -o "${outputFile}"`);

    // Execute
    const executeCommand = input
      ? `"${outputFile}" < "${inputFile}"`
      : `"${outputFile}"`;
    
    const { stdout, stderr } = await execAsync(executeCommand, { timeout: 5000 });
    
    return stderr ? `${stdout}\n${stderr}` : stdout;
  } finally {
    // Cleanup
    await Promise.allSettled([
      unlink(sourceFile),
      unlink(outputFile),
      input ? unlink(inputFile) : Promise.resolve(),
    ]);
  }
}

async function executePython(code: string, input: string): Promise<string> {
  await ensureTempDir();
  const fileName = `temp_${Date.now()}.py`;
  const sourceFile = path.join(tempDir, fileName);
  const inputFile = path.join(tempDir, `${fileName}_input.txt`);

  try {
    await writeFile(sourceFile, code);
    if (input) await writeFile(inputFile, input);

    // Execute
    const executeCommand = input
      ? `python "${sourceFile}" < "${inputFile}"`
      : `python "${sourceFile}"`;
    
    const { stdout, stderr } = await execAsync(executeCommand, { timeout: 5000 });
    
    return stderr ? `${stdout}\n${stderr}` : stdout;
  } finally {
    // Cleanup
    await Promise.allSettled([
      unlink(sourceFile),
      input ? unlink(inputFile) : Promise.resolve(),
    ]);
  }
}

async function executeJava(code: string, input: string): Promise<string> {
  await ensureTempDir();
  const fileName = `Main`;
  const sourceFile = path.join(tempDir, `${fileName}.java`);
  const inputFile = path.join(tempDir, `${fileName}_input.txt`);

  try {
    await writeFile(sourceFile, code);
    if (input) await writeFile(inputFile, input);

    // Compile
    await execAsync(`javac "${sourceFile}"`, { cwd: tempDir });

    // Execute
    const executeCommand = input
      ? `java -cp "${tempDir}" ${fileName} < "${inputFile}"`
      : `java -cp "${tempDir}" ${fileName}`;
    
    const { stdout, stderr } = await execAsync(executeCommand, { timeout: 5000 });
    
    return stderr ? `${stdout}\n${stderr}` : stdout;
  } finally {
    // Cleanup
    const classFile = path.join(tempDir, `${fileName}.class`);
    await Promise.allSettled([
      unlink(sourceFile),
      unlink(classFile),
      input ? unlink(inputFile) : Promise.resolve(),
    ]);
  }
}

async function executeJavaScript(code: string, input: string): Promise<string> {
  await ensureTempDir();
  const fileName = `temp_${Date.now()}.js`;
  const sourceFile = path.join(tempDir, fileName);
  const inputFile = path.join(tempDir, `${fileName}_input.txt`);

  try {
    // If there's input, modify the code to read from stdin
    let modifiedCode = code;
    if (input) {
      await writeFile(inputFile, input);
      modifiedCode = `
const fs = require('fs');
const readline = require('readline');

// Override console.log temporarily to capture output
const originalLog = console.log;
let output = '';
console.log = (...args) => {
  output += args.join(' ') + '\\n';
  originalLog(...args);
};

// Your code
${code}
`;
    }
    
    await writeFile(sourceFile, modifiedCode);

    // Execute
    const executeCommand = input
      ? `node "${sourceFile}" < "${inputFile}"`
      : `node "${sourceFile}"`;
    
    const { stdout, stderr } = await execAsync(executeCommand, { timeout: 5000 });
    
    return stderr ? `${stdout}\n${stderr}` : stdout;
  } finally {
    // Cleanup
    await Promise.allSettled([
      unlink(sourceFile),
      input ? unlink(inputFile) : Promise.resolve(),
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { language, code, input = '' } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    let output: string;

    switch (language) {
      case 'c':
        output = await executeC(code, input);
        break;
      case 'cpp':
        output = await executeCpp(code, input);
        break;
      case 'python':
        output = await executePython(code, input);
        break;
      case 'java':
        output = await executeJava(code, input);
        break;
      case 'javascript':
        output = await executeJavaScript(code, input);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported language: ${language}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during code execution' },
      { status: 500 }
    );
  }
}
