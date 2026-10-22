// ─── Battle Mode Question Bank ───────────────────────────────────────────────
// Contains MCQ (Round 1), Debug (Round 2), and DSA (Final) questions

import { MCQQuestion, DebugQuestion, DSAQuestion, BattleLanguage } from './battleTypes';

// ─── Round 1: Predict the Output MCQs ────────────────────────────────────────
export const BATTLE_MCQ_QUESTIONS: MCQQuestion[] = [
  // Python questions
  {
    questionId: 'py-mcq-1',
    roundType: 'round1',
    language: 'python',
    prompt: `x = [1, 2, 3]
y = x
y.append(4)
print(len(x))`,
    options: ['3', '4', 'Error', 'None'],
    correctIndex: 1,
    points: 100,
    order: 1,
  },
  {
    questionId: 'py-mcq-2',
    roundType: 'round1',
    language: 'python',
    prompt: `def f(a, b=[]):
    b.append(a)
    return b

print(f(1))
print(f(2))`,
    options: ['[1]\n[2]', '[1]\n[1, 2]', '[1, 2]\n[1, 2]', 'Error'],
    correctIndex: 1,
    points: 100,
    order: 2,
  },
  {
    questionId: 'py-mcq-3',
    roundType: 'round1',
    language: 'python',
    prompt: `x = "hello"
print(x[::-1])`,
    options: ['hello', 'olleh', 'Error', 'hllo'],
    correctIndex: 1,
    points: 100,
    order: 3,
  },
  {
    questionId: 'py-mcq-4',
    roundType: 'round1',
    language: 'python',
    prompt: `a = 5
b = 2
print(a // b, a % b)`,
    options: ['2 1', '2.5 1', '2 0', '3 1'],
    correctIndex: 0,
    points: 100,
    order: 4,
  },
  {
    questionId: 'py-mcq-5',
    roundType: 'round1',
    language: 'python',
    prompt: `d = {'a': 1, 'b': 2}
d['c'] = d.get('d', 0) + 3
print(d['c'])`,
    options: ['0', '3', '2', 'KeyError'],
    correctIndex: 1,
    points: 100,
    order: 5,
  },
  {
    questionId: 'py-mcq-6',
    roundType: 'round1',
    language: 'python',
    prompt: `nums = [1, 2, 3, 4, 5]
result = list(filter(lambda x: x % 2 == 0, nums))
print(result)`,
    options: ['[1, 3, 5]', '[2, 4]', '[1, 2, 3, 4, 5]', '[]'],
    correctIndex: 1,
    points: 100,
    order: 6,
  },
  {
    questionId: 'py-mcq-7',
    roundType: 'round1',
    language: 'python',
    prompt: `class Foo:
    count = 0
    def __init__(self):
        Foo.count += 1

a = Foo()
b = Foo()
print(Foo.count)`,
    options: ['0', '1', '2', 'Error'],
    correctIndex: 2,
    points: 100,
    order: 7,
  },
  {
    questionId: 'py-mcq-8',
    roundType: 'round1',
    language: 'python',
    prompt: `print(type(1 / 2))`,
    options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", 'Error'],
    correctIndex: 1,
    points: 100,
    order: 8,
  },
  {
    questionId: 'py-mcq-9',
    roundType: 'round1',
    language: 'python',
    prompt: `s = "abcdef"
print(s[1:4])`,
    options: ['abc', 'bcd', 'bcde', 'abcd'],
    correctIndex: 1,
    points: 100,
    order: 9,
  },
  {
    questionId: 'py-mcq-10',
    roundType: 'round1',
    language: 'python',
    prompt: `x = [i**2 for i in range(5)]
print(sum(x))`,
    options: ['10', '30', '25', '55'],
    correctIndex: 1,
    points: 100,
    order: 10,
  },
  {
    questionId: 'py-mcq-11',
    roundType: 'round1',
    language: 'python',
    prompt: `a, b = 3, 5
a, b = b, a
print(a, b)`,
    options: ['3 5', '5 3', '5 5', '3 3'],
    correctIndex: 1,
    points: 100,
    order: 11,
  },
  {
    questionId: 'py-mcq-12',
    roundType: 'round1',
    language: 'python',
    prompt: `n = 10
print(bin(n))`,
    options: ['0b1010', '1010', '0b1100', '10'],
    correctIndex: 0,
    points: 100,
    order: 12,
  },
  {
    questionId: 'py-mcq-13',
    roundType: 'round1',
    language: 'python',
    prompt: `lst = [3, 1, 4, 1, 5, 9]
lst.sort(reverse=True)
print(lst[0])`,
    options: ['1', '3', '9', '5'],
    correctIndex: 2,
    points: 100,
    order: 13,
  },
  {
    questionId: 'py-mcq-14',
    roundType: 'round1',
    language: 'python',
    prompt: `t = (1, 2, 3)
print(t[1:])`,
    options: ['(2,)', '(2, 3)', '[2, 3]', '2 3'],
    correctIndex: 1,
    points: 100,
    order: 14,
  },
  {
    questionId: 'py-mcq-15',
    roundType: 'round1',
    language: 'python',
    prompt: `x = None
print(bool(x), bool(0), bool(""))`,
    options: ['True True True', 'False False False', 'None False False', 'False False True'],
    correctIndex: 1,
    points: 100,
    order: 15,
  },
  // C++ questions
  {
    questionId: 'cpp-mcq-1',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int x = 5;
    cout << x++ << " " << ++x;
}`,
    options: ['5 7', '6 7', '5 6', '6 6'],
    correctIndex: 0,
    points: 100,
    order: 1,
  },
  {
    questionId: 'cpp-mcq-2',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int a = 10, b = 3;
    cout << a / b << " " << a % b;
}`,
    options: ['3 1', '3.33 1', '3 0', '4 1'],
    correctIndex: 0,
    points: 100,
    order: 2,
  },
  {
    questionId: 'cpp-mcq-3',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int arr[] = {1, 2, 3, 4, 5};
    cout << sizeof(arr) / sizeof(arr[0]);
}`,
    options: ['5', '20', '1', '4'],
    correctIndex: 0,
    points: 100,
    order: 3,
  },
  {
    questionId: 'cpp-mcq-4',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    bool a = true, b = false;
    cout << (a || b) << " " << (a && b);
}`,
    options: ['1 0', '1 1', '0 0', 'true false'],
    correctIndex: 0,
    points: 100,
    order: 4,
  },
  {
    questionId: 'cpp-mcq-5',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int x = 0;
    for(int i = 0; i < 5; i++) x += i;
    cout << x;
}`,
    options: ['10', '15', '5', '0'],
    correctIndex: 0,
    points: 100,
    order: 5,
  },
  {
    questionId: 'cpp-mcq-6',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
#include<string>
using namespace std;
int main() {
    string s = "hello";
    s[0] = 'H';
    cout << s;
}`,
    options: ['hello', 'Hello', 'HELLO', 'Error'],
    correctIndex: 1,
    points: 100,
    order: 6,
  },
  {
    questionId: 'cpp-mcq-7',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int f(int n) {
    if(n <= 1) return n;
    return f(n-1) + f(n-2);
}
int main() {
    cout << f(6);
}`,
    options: ['8', '13', '5', '6'],
    correctIndex: 0,
    points: 100,
    order: 7,
  },
  {
    questionId: 'cpp-mcq-8',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int x = 7;
    cout << (x & 3) << " " << (x | 3);
}`,
    options: ['3 7', '7 3', '1 7', '3 3'],
    correctIndex: 0,
    points: 100,
    order: 8,
  },
  {
    questionId: 'cpp-mcq-9',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int n = 16;
    cout << (n >> 2);
}`,
    options: ['4', '8', '64', '2'],
    correctIndex: 0,
    points: 100,
    order: 9,
  },
  {
    questionId: 'cpp-mcq-10',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
#include<vector>
using namespace std;
int main() {
    vector<int> v = {5, 3, 8, 1};
    sort(v.begin(), v.end());
    cout << v[0] << " " << v.back();
}`,
    options: ['1 8', '5 1', '8 1', '1 5'],
    correctIndex: 0,
    points: 100,
    order: 10,
  },
  {
    questionId: 'cpp-mcq-11',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int a = 5;
    int *p = &a;
    *p = 10;
    cout << a;
}`,
    options: ['5', '10', 'Error', '0'],
    correctIndex: 1,
    points: 100,
    order: 11,
  },
  {
    questionId: 'cpp-mcq-12',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int x = 1;
    while(x < 100) x *= 2;
    cout << x;
}`,
    options: ['64', '128', '100', '256'],
    correctIndex: 1,
    points: 100,
    order: 12,
  },
  {
    questionId: 'cpp-mcq-13',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    char c = 'A';
    cout << (int)c;
}`,
    options: ['A', '65', '97', '64'],
    correctIndex: 1,
    points: 100,
    order: 13,
  },
  {
    questionId: 'cpp-mcq-14',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
using namespace std;
int main() {
    int x = 5;
    cout << (x > 3 ? "yes" : "no");
}`,
    options: ['yes', 'no', 'true', '1'],
    correctIndex: 0,
    points: 100,
    order: 14,
  },
  {
    questionId: 'cpp-mcq-15',
    roundType: 'round1',
    language: 'cpp',
    prompt: `#include<iostream>
#include<cmath>
using namespace std;
int main() {
    cout << pow(2, 10);
}`,
    options: ['20', '1024', '512', '2048'],
    correctIndex: 1,
    points: 100,
    order: 15,
  },
  // Java questions
  {
    questionId: 'java-mcq-1',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        System.out.println(x++);
        System.out.println(x);
    }
}`,
    options: ['5\n5', '5\n6', '6\n6', '6\n5'],
    correctIndex: 1,
    points: 100,
    order: 1,
  },
  {
    questionId: 'java-mcq-2',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        String s = "hello";
        String t = "hello";
        System.out.println(s == t);
        System.out.println(s.equals(t));
    }
}`,
    options: ['true\ntrue', 'false\ntrue', 'true\nfalse', 'false\nfalse'],
    correctIndex: 0,
    points: 100,
    order: 2,
  },
  {
    questionId: 'java-mcq-3',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        System.out.println(arr.length);
    }
}`,
    options: ['4', '5', '6', 'Error'],
    correctIndex: 1,
    points: 100,
    order: 3,
  },
  {
    questionId: 'java-mcq-4',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    static int n = 0;
    public static void main(String[] args) {
        for(int i = 1; i <= 5; i++) n += i;
        System.out.println(n);
    }
}`,
    options: ['10', '15', '5', '20'],
    correctIndex: 1,
    points: 100,
    order: 4,
  },
  {
    questionId: 'java-mcq-5',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int x = 7 / 2;
        System.out.println(x);
    }
}`,
    options: ['3.5', '3', '4', 'Error'],
    correctIndex: 1,
    points: 100,
    order: 5,
  },
  {
    questionId: 'java-mcq-6',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        String s = "Hello World";
        System.out.println(s.substring(6));
    }
}`,
    options: ['Hello', 'World', 'Hello World', 'ello World'],
    correctIndex: 1,
    points: 100,
    order: 6,
  },
  {
    questionId: 'java-mcq-7',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = a >> 1;
        System.out.println(b);
    }
}`,
    options: ['10', '5', '20', '2'],
    correctIndex: 1,
    points: 100,
    order: 7,
  },
  {
    questionId: 'java-mcq-8',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        boolean a = true;
        boolean b = false;
        System.out.println(a ^ b);
    }
}`,
    options: ['true', 'false', 'Error', '1'],
    correctIndex: 0,
    points: 100,
    order: 8,
  },
  {
    questionId: 'java-mcq-9',
    roundType: 'round1',
    language: 'java',
    prompt: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5));
        Collections.sort(list);
        System.out.println(list.get(0));
    }
}`,
    options: ['3', '1', '4', '5'],
    correctIndex: 1,
    points: 100,
    order: 9,
  },
  {
    questionId: 'java-mcq-10',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int x = 0b1010;
        System.out.println(x);
    }
}`,
    options: ['1010', '10', '8', '12'],
    correctIndex: 1,
    points: 100,
    order: 10,
  },
  {
    questionId: 'java-mcq-11',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        char c = 'a';
        System.out.println((int) c);
    }
}`,
    options: ['a', '65', '97', '98'],
    correctIndex: 2,
    points: 100,
    order: 11,
  },
  {
    questionId: 'java-mcq-12',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x++ + ++x;
        System.out.println(y);
    }
}`,
    options: ['11', '12', '10', '13'],
    correctIndex: 1,
    points: 100,
    order: 12,
  },
  {
    questionId: 'java-mcq-13',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        String s = "abcde";
        System.out.println(s.charAt(2));
    }
}`,
    options: ['a', 'b', 'c', 'd'],
    correctIndex: 2,
    points: 100,
    order: 13,
  },
  {
    questionId: 'java-mcq-14',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int n = 2;
        for(int i = 0; i < 4; i++) n *= n;
        System.out.println(n);
    }
}`,
    options: ['16', '65536', '256', '4294967296'],
    correctIndex: 1,
    points: 100,
    order: 14,
  },
  {
    questionId: 'java-mcq-15',
    roundType: 'round1',
    language: 'java',
    prompt: `public class Main {
    public static void main(String[] args) {
        int[] arr = new int[5];
        System.out.println(arr[0]);
    }
}`,
    options: ['null', 'undefined', '0', 'Error'],
    correctIndex: 2,
    points: 100,
    order: 15,
  },
];

// ─── Round 2: Debug the Code Questions ───────────────────────────────────────
export const BATTLE_DEBUG_QUESTIONS: DebugQuestion[] = [
  // Python debug
  {
    questionId: 'py-debug-1',
    roundType: 'round2',
    language: 'python',
    prompt: 'Fix the function to return the factorial of n correctly.',
    buggyCode: `def factorial(n):
    if n == 0:
        return 0
    return n * factorial(n - 1)

print(factorial(5))`,
    starterCode: `def factorial(n):
    if n == 0:
        return 0  # Bug here
    return n * factorial(n - 1)

print(factorial(5))`,
    testCases: [
      { input: '', expectedOutput: '120' },
      { input: '', expectedOutput: '120', isHidden: true },
    ],
    points: 200,
    order: 1,
  },
  {
    questionId: 'py-debug-2',
    roundType: 'round2',
    language: 'python',
    prompt: 'Fix the function to check if a number is prime.',
    buggyCode: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

print(is_prime(7))
print(is_prime(4))`,
    starterCode: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True  # Works but very slow for large n — optimize it

print(is_prime(7))
print(is_prime(4))`,
    testCases: [
      { input: '', expectedOutput: 'True\nFalse' },
      { input: '', expectedOutput: 'True\nFalse', isHidden: true },
    ],
    points: 200,
    order: 2,
  },
  {
    questionId: 'py-debug-3',
    roundType: 'round2',
    language: 'python',
    prompt: 'Fix the binary search function to return the correct index or -1.',
    buggyCode: `def binary_search(arr, target):
    left, right = 0, len(arr)
    while left < right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid
        else:
            right = mid
    return -1

print(binary_search([1, 3, 5, 7, 9], 5))`,
    starterCode: `def binary_search(arr, target):
    left, right = 0, len(arr)  # Bug 1
    while left < right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid  # Bug 2
        else:
            right = mid  # Bug 3
    return -1

print(binary_search([1, 3, 5, 7, 9], 5))`,
    testCases: [
      { input: '', expectedOutput: '2' },
      { input: '', expectedOutput: '2', isHidden: true },
    ],
    points: 200,
    order: 3,
  },
  {
    questionId: 'py-debug-4',
    roundType: 'round2',
    language: 'python',
    prompt: 'Fix the function to reverse a linked list iteratively.',
    buggyCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverse(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = next_node
        prev = curr
        curr = next_node
    return prev

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
rev = reverse(head)
while rev:
    print(rev.val, end=' ')
    rev = rev.next`,
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverse(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = next_node  # Bug here
        prev = curr
        curr = next_node
    return prev

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
rev = reverse(head)
while rev:
    print(rev.val, end=' ')
    rev = rev.next`,
    testCases: [
      { input: '', expectedOutput: '3 2 1 ' },
      { input: '', expectedOutput: '3 2 1 ', isHidden: true },
    ],
    points: 200,
    order: 4,
  },
  {
    questionId: 'py-debug-5',
    roundType: 'round2',
    language: 'python',
    prompt: 'Fix the function to find the maximum subarray sum (Kadane\'s algorithm).',
    buggyCode: `def max_subarray(nums):
    max_sum = 0
    current_sum = 0
    for num in nums:
        current_sum += num
        if current_sum > max_sum:
            max_sum = current_sum
        if current_sum < 0:
            current_sum = 0
    return max_sum

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
    starterCode: `def max_subarray(nums):
    max_sum = 0  # Bug: should handle all-negative arrays
    current_sum = 0
    for num in nums:
        current_sum += num
        if current_sum > max_sum:
            max_sum = current_sum
        if current_sum < 0:
            current_sum = 0
    return max_sum

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
    testCases: [
      { input: '', expectedOutput: '6' },
      { input: '', expectedOutput: '6', isHidden: true },
    ],
    points: 200,
    order: 5,
  },
  // C++ debug
  {
    questionId: 'cpp-debug-1',
    roundType: 'round2',
    language: 'cpp',
    prompt: 'Fix the factorial function in C++.',
    buggyCode: `#include<iostream>
using namespace std;
int factorial(int n) {
    if(n == 0) return 0;
    return n * factorial(n-1);
}
int main() {
    cout << factorial(5);
}`,
    starterCode: `#include<iostream>
using namespace std;
int factorial(int n) {
    if(n == 0) return 0; // Bug
    return n * factorial(n-1);
}
int main() {
    cout << factorial(5);
}`,
    testCases: [
      { input: '', expectedOutput: '120' },
      { input: '', expectedOutput: '120', isHidden: true },
    ],
    points: 200,
    order: 1,
  },
  {
    questionId: 'cpp-debug-2',
    roundType: 'round2',
    language: 'cpp',
    prompt: 'Fix the bubble sort implementation.',
    buggyCode: `#include<iostream>
#include<vector>
using namespace std;
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n - i; j++) {
            if(arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);
        }
    }
}
int main() {
    vector<int> v = {5, 3, 8, 1, 2};
    bubbleSort(v);
    for(int x : v) cout << x << " ";
}`,
    starterCode: `#include<iostream>
#include<vector>
using namespace std;
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n - i; j++) { // Bug: off by one
            if(arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);
        }
    }
}
int main() {
    vector<int> v = {5, 3, 8, 1, 2};
    bubbleSort(v);
    for(int x : v) cout << x << " ";
}`,
    testCases: [
      { input: '', expectedOutput: '1 2 3 5 8 ' },
      { input: '', expectedOutput: '1 2 3 5 8 ', isHidden: true },
    ],
    points: 200,
    order: 2,
  },
  {
    questionId: 'cpp-debug-3',
    roundType: 'round2',
    language: 'cpp',
    prompt: 'Fix the binary search function.',
    buggyCode: `#include<iostream>
#include<vector>
using namespace std;
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size();
    while(left < right) {
        int mid = left + (right - left) / 2;
        if(arr[mid] == target) return mid;
        else if(arr[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}
int main() {
    vector<int> v = {1, 3, 5, 7, 9};
    cout << binarySearch(v, 7);
}`,
    starterCode: `#include<iostream>
#include<vector>
using namespace std;
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size(); // Bug 1
    while(left < right) {
        int mid = left + (right - left) / 2;
        if(arr[mid] == target) return mid;
        else if(arr[mid] < target) left = mid; // Bug 2
        else right = mid; // Bug 3
    }
    return -1;
}
int main() {
    vector<int> v = {1, 3, 5, 7, 9};
    cout << binarySearch(v, 7);
}`,
    testCases: [
      { input: '', expectedOutput: '3' },
      { input: '', expectedOutput: '3', isHidden: true },
    ],
    points: 200,
    order: 3,
  },
  {
    questionId: 'cpp-debug-4',
    roundType: 'round2',
    language: 'cpp',
    prompt: 'Fix the palindrome check function.',
    buggyCode: `#include<iostream>
#include<string>
using namespace std;
bool isPalindrome(string s) {
    int left = 0, right = s.size();
    while(left < right) {
        if(s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}
int main() {
    cout << isPalindrome("racecar") << " " << isPalindrome("hello");
}`,
    starterCode: `#include<iostream>
#include<string>
using namespace std;
bool isPalindrome(string s) {
    int left = 0, right = s.size(); // Bug
    while(left < right) {
        if(s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}
int main() {
    cout << isPalindrome("racecar") << " " << isPalindrome("hello");
}`,
    testCases: [
      { input: '', expectedOutput: '1 0' },
      { input: '', expectedOutput: '1 0', isHidden: true },
    ],
    points: 200,
    order: 4,
  },
  {
    questionId: 'cpp-debug-5',
    roundType: 'round2',
    language: 'cpp',
    prompt: 'Fix the GCD function using Euclidean algorithm.',
    buggyCode: `#include<iostream>
using namespace std;
int gcd(int a, int b) {
    while(b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return b;
}
int main() {
    cout << gcd(48, 18);
}`,
    starterCode: `#include<iostream>
using namespace std;
int gcd(int a, int b) {
    while(b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return b; // Bug: should return a
}
int main() {
    cout << gcd(48, 18);
}`,
    testCases: [
      { input: '', expectedOutput: '6' },
      { input: '', expectedOutput: '6', isHidden: true },
    ],
    points: 200,
    order: 5,
  },
  // Java debug
  {
    questionId: 'java-debug-1',
    roundType: 'round2',
    language: 'java',
    prompt: 'Fix the factorial function in Java.',
    buggyCode: `public class Main {
    static int factorial(int n) {
        if(n == 0) return 0;
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
    starterCode: `public class Main {
    static int factorial(int n) {
        if(n == 0) return 0; // Bug
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
    testCases: [
      { input: '', expectedOutput: '120' },
      { input: '', expectedOutput: '120', isHidden: true },
    ],
    points: 200,
    order: 1,
  },
  {
    questionId: 'java-debug-2',
    roundType: 'round2',
    language: 'java',
    prompt: 'Fix the string reversal function.',
    buggyCode: `public class Main {
    static String reverse(String s) {
        String result = "";
        for(int i = 0; i <= s.length(); i++) {
            result = s.charAt(i) + result;
        }
        return result;
    }
    public static void main(String[] args) {
        System.out.println(reverse("hello"));
    }
}`,
    starterCode: `public class Main {
    static String reverse(String s) {
        String result = "";
        for(int i = 0; i <= s.length(); i++) { // Bug: off by one
            result = s.charAt(i) + result;
        }
        return result;
    }
    public static void main(String[] args) {
        System.out.println(reverse("hello"));
    }
}`,
    testCases: [
      { input: '', expectedOutput: 'olleh' },
      { input: '', expectedOutput: 'olleh', isHidden: true },
    ],
    points: 200,
    order: 2,
  },
  {
    questionId: 'java-debug-3',
    roundType: 'round2',
    language: 'java',
    prompt: 'Fix the array sum function.',
    buggyCode: `public class Main {
    static int sumArray(int[] arr) {
        int sum = 0;
        for(int i = 0; i <= arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
    public static void main(String[] args) {
        System.out.println(sumArray(new int[]{1, 2, 3, 4, 5}));
    }
}`,
    starterCode: `public class Main {
    static int sumArray(int[] arr) {
        int sum = 0;
        for(int i = 0; i <= arr.length; i++) { // Bug: off by one
            sum += arr[i];
        }
        return sum;
    }
    public static void main(String[] args) {
        System.out.println(sumArray(new int[]{1, 2, 3, 4, 5}));
    }
}`,
    testCases: [
      { input: '', expectedOutput: '15' },
      { input: '', expectedOutput: '15', isHidden: true },
    ],
    points: 200,
    order: 3,
  },
  {
    questionId: 'java-debug-4',
    roundType: 'round2',
    language: 'java',
    prompt: 'Fix the Fibonacci function.',
    buggyCode: `public class Main {
    static int fib(int n) {
        if(n <= 0) return 0;
        if(n == 1) return 1;
        return fib(n-1) + fib(n-3);
    }
    public static void main(String[] args) {
        System.out.println(fib(7));
    }
}`,
    starterCode: `public class Main {
    static int fib(int n) {
        if(n <= 0) return 0;
        if(n == 1) return 1;
        return fib(n-1) + fib(n-3); // Bug: should be n-2
    }
    public static void main(String[] args) {
        System.out.println(fib(7));
    }
}`,
    testCases: [
      { input: '', expectedOutput: '13' },
      { input: '', expectedOutput: '13', isHidden: true },
    ],
    points: 200,
    order: 4,
  },
  {
    questionId: 'java-debug-5',
    roundType: 'round2',
    language: 'java',
    prompt: 'Fix the power function.',
    buggyCode: `public class Main {
    static long power(long base, int exp) {
        long result = 0;
        while(exp > 0) {
            if((exp & 1) == 1) result *= base;
            base *= base;
            exp >>= 1;
        }
        return result;
    }
    public static void main(String[] args) {
        System.out.println(power(2, 10));
    }
}`,
    starterCode: `public class Main {
    static long power(long base, int exp) {
        long result = 0; // Bug: should be 1
        while(exp > 0) {
            if((exp & 1) == 1) result *= base;
            base *= base;
            exp >>= 1;
        }
        return result;
    }
    public static void main(String[] args) {
        System.out.println(power(2, 10));
    }
}`,
    testCases: [
      { input: '', expectedOutput: '1024' },
      { input: '', expectedOutput: '1024', isHidden: true },
    ],
    points: 200,
    order: 5,
  },
];

// ─── Final Round: DSA Problems ────────────────────────────────────────────────
export const BATTLE_DSA_PROBLEMS: DSAQuestion[] = [
  {
    questionId: 'dsa-final-1',
    roundType: 'final',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Return the answer in any order.`,
    inputFormat: 'First line: n (array size) and target. Second line: n space-separated integers.',
    outputFormat: 'Two space-separated indices i j such that nums[i] + nums[j] == target.',
    constraints: ['2 <= n <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [
      { input: '4 9\n2 7 11 15', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3 6\n3 2 4', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    starterCode: {
      python: `import sys
input_data = sys.stdin.read().split()
idx = 0
n, target = int(input_data[idx]), int(input_data[idx+1])
idx += 2
nums = [int(input_data[idx+i]) for i in range(n)]

# Your solution here
def two_sum(nums, target):
    pass

result = two_sum(nums, target)
print(result[0], result[1])`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for(int i = 0; i < n; i++) cin >> nums[i];
    
    // Your solution here
    
    return 0;
}`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), target = sc.nextInt();
        int[] nums = new int[n];
        for(int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        // Your solution here
        
    }
}`,
    },
    testCases: [
      { input: '4 9\n2 7 11 15', expectedOutput: '0 1' },
      { input: '3 6\n3 2 4', expectedOutput: '1 2' },
      { input: '2 6\n3 3', expectedOutput: '0 1', isHidden: true },
      { input: '5 10\n1 5 3 7 9', expectedOutput: '1 3', isHidden: true },
    ],
    points: 500,
    order: 1,
  },
  {
    questionId: 'dsa-final-2',
    roundType: 'final',
    title: 'Maximum Subarray Sum',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.`,
    inputFormat: 'First line: n (array size). Second line: n space-separated integers.',
    outputFormat: 'A single integer — the maximum subarray sum.',
    constraints: ['1 <= n <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
      { input: '1\n1', output: '1' },
      { input: '5\n5 4 -1 7 8', output: '23' },
    ],
    starterCode: {
      python: `import sys
data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:n+1]))

# Your solution here (Kadane's Algorithm)
def max_subarray(nums):
    pass

print(max_subarray(nums))`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n;
    cin >> n;
    vector<int> nums(n);
    for(int i = 0; i < n; i++) cin >> nums[i];
    
    // Your solution here (Kadane's Algorithm)
    
    return 0;
}`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for(int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        // Your solution here (Kadane's Algorithm)
        
    }
}`,
    },
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { input: '1\n1', expectedOutput: '1' },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23' },
      { input: '4\n-2 -3 -1 -4', expectedOutput: '-1', isHidden: true },
      { input: '6\n1 2 3 4 5 6', expectedOutput: '21', isHidden: true },
    ],
    points: 500,
    order: 2,
  },
];

// ─── Question Selection Helpers ───────────────────────────────────────────────
export function getMCQsForLanguage(language: BattleLanguage): MCQQuestion[] {
  return BATTLE_MCQ_QUESTIONS.filter(q => q.language === language);
}

export function getDebugQsForLanguage(language: BattleLanguage): DebugQuestion[] {
  return BATTLE_DEBUG_QUESTIONS.filter(q => q.language === language);
}

export function getFinalDSAProblems(): DSAQuestion[] {
  return BATTLE_DSA_PROBLEMS;
}

// Return safe (no-answer) version of MCQ for client
export function sanitizeMCQ(q: MCQQuestion): Omit<MCQQuestion, 'correctIndex'> {
  const { correctIndex: _ci, ...rest } = q;
  return rest;
}

// Return safe version of debug question (without hidden test cases)
export function sanitizeDebugQ(q: DebugQuestion): DebugQuestion {
  return {
    ...q,
    testCases: q.testCases.filter(tc => !tc.isHidden),
  };
}

export function sanitizeDSAQ(q: DSAQuestion): DSAQuestion {
  return {
    ...q,
    testCases: q.testCases.filter(tc => !tc.isHidden),
  };
}
