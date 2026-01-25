'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

type Language = 'c' | 'cpp' | 'python' | 'java' | 'javascript';

const languageTemplates: Record<Language, string> = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  python: `print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  javascript: `console.log("Hello, World!");`,
};

const languageOptions: { value: Language; label: string; monacoLang: string }[] = [
  { value: 'c', label: 'C', monacoLang: 'c' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(languageTemplates.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(languageTemplates[newLang]);
    setOutput('');
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('Running...');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          input,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput(`Error:\n${data.error}`);
      } else {
        setOutput(data.output || 'Program executed successfully with no output.');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonacoLang = languageOptions.find(l => l.value === language)?.monacoLang || 'python';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Code Compiler</h1>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {languageOptions.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRunCode}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Code Editor</h2>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={currentMonacoLang}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Input/Output Panel */}
        <div className="w-96 flex flex-col border-l border-gray-700">
          {/* Input Section */}
          <div className="flex-1 flex flex-col border-b border-gray-700">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-300">Input</h2>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              className="flex-1 bg-gray-900 text-white p-4 resize-none focus:outline-none font-mono text-sm"
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-300">Output</h2>
            </div>
            <pre className="flex-1 bg-gray-900 text-white p-4 overflow-auto font-mono text-sm whitespace-pre-wrap">
              {output || 'Output will appear here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
