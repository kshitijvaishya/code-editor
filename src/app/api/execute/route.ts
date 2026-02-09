import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { userDb } from '@/lib/userDb';

type Language = 'c' | 'cpp' | 'python' | 'java' | 'javascript';

interface ExecuteRequest {
  language: Language;
  code: string;
  input?: string;
}

// Piston API endpoint (free and open-source, no API key required)
const PISTON_API = 'https://emkc.org/api/v2/piston';

// Map our language names to Piston's language identifiers
const languageMap: Record<Language, { language: string; version: string }> = {
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  javascript: { language: 'javascript', version: '18.15.0' },
};

async function executeCodeWithPiston(
  language: string,
  version: string,
  code: string,
  input: string
): Promise<{ output?: string; error?: string; executionTime?: number }> {
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            name: language === 'java' ? 'Main.java' : `main.${language}`,
            content: code,
          },
        ],
        stdin: input,
      }),
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Combine stdout and stderr
    const output = result.run.stdout || '';
    const error = result.run.stderr || '';

    if (error) {
      return { error, executionTime };
    }

    return { 
      output: output || 'Program executed successfully with no output.',
      executionTime 
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to execute code' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { language, code, input = '' } = body;

    if (!language || !code) {
      return NextResponse.json(
        { success: false, error: 'Language and code are required' },
        { status: 400 }
      );
    }

    // Track code runs for authenticated users
    const currentUser = await getCurrentUser(request);
    if (currentUser) {
      try {
        await userDb.incrementCodeRuns(currentUser.userId);
      } catch (error) {
        console.error('Failed to increment code runs:', error);
      }
    }

    const langConfig = languageMap[language];
    if (!langConfig) {
      return NextResponse.json(
        { success: false, error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const result = await executeCodeWithPiston(
      langConfig.language,
      langConfig.version,
      code,
      input
    );

    if (result.error) {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        executionTime: result.executionTime 
      });
    }

    return NextResponse.json({ 
      success: true, 
      output: result.output,
      executionTime: result.executionTime 
    });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred during code execution' },
      { status: 500 }
    );
  }
}
