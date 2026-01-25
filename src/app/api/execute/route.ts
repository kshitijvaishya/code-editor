import { NextRequest, NextResponse } from 'next/server';

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
): Promise<{ output?: string; error?: string }> {
  try {
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

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Combine stdout and stderr
    const output = result.run.stdout || '';
    const error = result.run.stderr || '';

    if (error) {
      return { error };
    }

    return { output: output || 'Program executed successfully with no output.' };
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
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    const langConfig = languageMap[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
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
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during code execution' },
      { status: 500 }
    );
  }
}
