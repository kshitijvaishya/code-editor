# Code Execution Guide

## Overview
This document provides instructions for executing code in the online compiler system. The platform supports multiple programming languages and provides a secure execution environment.

## Supported Languages

- **C** - Compiled with GCC
- **C++** - Compiled with G++
- **Python** - Python 3.x interpreter
- **Java** - Java JDK compiler and runtime
- **JavaScript** - Node.js runtime

## API Endpoint

### Execute Code
**Endpoint:** `POST /api/execute`

**Request Body:**
```json
{
  "code": "string",      // Source code to execute
  "language": "string",  // Language identifier (c, cpp, python, java, javascript)
  "input": "string"      // Optional: stdin input for the program
}
```

**Response:**
```json
{
  "output": "string",    // Program output (stdout)
  "error": "string",     // Error messages (stderr)
  "executionTime": "number" // Execution time in milliseconds
}
```

## Language Identifiers

| Language   | Identifier   |
|------------|--------------|
| C          | `c`          |
| C++        | `cpp`        |
| Python     | `python`     |
| Java       | `java`       |
| JavaScript | `javascript` |

## Usage Examples

### 1. Execute Python Code

```javascript
const response = await fetch('/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'print("Hello, World!")',
    language: 'python',
    input: ''
  })
});

const result = await response.json();
console.log(result.output); // Hello, World!
```

### 2. Execute C++ Code with Input

```javascript
const cppCode = `
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << (a + b) << endl;
    return 0;
}
`;

const response = await fetch('/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: cppCode,
    language: 'cpp',
    input: '5 10'
  })
});

const result = await response.json();
console.log(result.output); // Sum: 15
```

### 3. Execute Java Code

```javascript
const javaCode = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
`;

const response = await fetch('/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: javaCode,
    language: 'java',
    input: ''
  })
});

const result = await response.json();
console.log(result.output); // Hello from Java!
```

### 4. Execute JavaScript Code

```javascript
const jsCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = '';
rl.on('line', (line) => {
  input += line;
});

rl.on('close', () => {
  console.log('You entered:', input);
});
`;

const response = await fetch('/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: jsCode,
    language: 'javascript',
    input: 'Test input'
  })
});
```

### 5. Execute C Code

```javascript
const cCode = `
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("Factorial of %d is %d\\n", n, factorial(n));
    return 0;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
`;

const response = await fetch('/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: cCode,
    language: 'c',
    input: '5'
  })
});
```

## Using the Code Editor Component

```tsx
import CodeEditor from '@/components/CodeEditor';

function MyComponent() {
  const handleExecute = async (code: string, language: string, input: string) => {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, input })
    });
    
    const result = await response.json();
    return result;
  };

  return (
    <CodeEditor 
      onExecute={handleExecute}
      defaultLanguage="python"
    />
  );
}
```

## Error Handling

### Compilation Errors
If code fails to compile, the `error` field will contain compiler error messages:

```json
{
  "output": "",
  "error": "compilation_error.cpp:5:1: error: expected ';' before '}' token",
  "executionTime": 0
}
```

### Runtime Errors
Runtime errors are captured in the `error` field:

```json
{
  "output": "Partial output...",
  "error": "ZeroDivisionError: division by zero",
  "executionTime": 45
}
```

### Timeout
Code execution has a timeout limit (typically 5-10 seconds) to prevent infinite loops:

```json
{
  "output": "",
  "error": "Execution timeout exceeded",
  "executionTime": 10000
}
```

## Security Considerations

1. **Sandboxed Execution** - Code runs in isolated containers
2. **Resource Limits** - Memory and CPU usage are restricted
3. **Timeout Protection** - Automatic termination of long-running code
4. **Network Isolation** - No external network access during execution
5. **File System Restrictions** - Limited file system access

## Best Practices

1. **Input Validation** - Always validate user input before execution
2. **Error Display** - Show clear error messages to users
3. **Loading States** - Indicate when code is executing
4. **Output Formatting** - Preserve formatting for better readability
5. **Language Selection** - Provide clear language selection UI
6. **Save Code** - Allow users to save their work
7. **Syntax Highlighting** - Use appropriate syntax highlighting for each language

## Testing Your Code

### Unit Test Example
```javascript
// Test C++ sum function
const testCases = [
  { input: '5 10', expected: 'Sum: 15' },
  { input: '0 0', expected: 'Sum: 0' },
  { input: '-5 5', expected: 'Sum: 0' }
];

for (const test of testCases) {
  const result = await executeCode(code, 'cpp', test.input);
  console.assert(
    result.output.trim() === test.expected,
    `Test failed for input: ${test.input}`
  );
}
```

## Contest Integration

The execution API is integrated with the contest system. See:
- [Contest System Documentation](CONTEST_SYSTEM.md)
- [Test Case System](TEST_CASE_SYSTEM.md)

For contest submissions, use the `/api/contests/submit` endpoint which internally uses the execution API with hidden test cases.

## Troubleshooting

### Code Won't Execute
- Check language identifier is correct
- Ensure code is properly formatted
- Verify API endpoint is accessible

### Wrong Output
- Check input format matches expected format
- Verify language-specific syntax
- Review error messages for hints

### Slow Execution
- Optimize algorithm complexity
- Reduce unnecessary computations
- Check for infinite loops

## Additional Resources

- [API Documentation](README.md)
- [MongoDB Integration](MONGODB_INTEGRATION.md)
- [Authentication Guide](AUTH_IMPLEMENTATION.md)
