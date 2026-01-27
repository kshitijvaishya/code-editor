# Contest Rules & Guidelines

## 📋 Contest Format

### What is a Contest?
A **coding contest** is a timed competition where participants solve Data Structures & Algorithms (DSA) problems to demonstrate their programming skills and problem-solving abilities.

### Contest Structure
- **Duration**: Varies per contest (typically 1-3 hours)
- **Problems**: Multiple DSA problems (Easy, Medium, Hard difficulty)
- **Languages**: C, C++, Python, Java, JavaScript
- **Environment**: Full-screen, proctored coding environment

---

## 🏆 Scoring & Ranking System

### How Winners Are Determined

Rankings are based on **three criteria** in this order:

#### 1️⃣ **PRIMARY: Test Cases Passed** (Most Important)
- Your rank is primarily determined by the **total number of test cases you pass**
- Each problem has multiple test cases (typically 5-10 per problem)
- **Partial credit is awarded**: Pass 3 out of 5 tests = 3 points toward your total

**Example:**
- Problem 1: Pass 5/5 tests = +5 to your total
- Problem 2: Pass 4/7 tests = +4 to your total
- Problem 3: Pass 0/8 tests = +0 to your total
- **Your Total: 9 test cases passed**

#### 2️⃣ **TIE-BREAKER 1: Execution Time** (Speed Matters)
- If two participants pass the same number of test cases, the **faster one ranks higher**
- Execution time = Sum of runtime for your best submission on each problem
- Lower execution time = Better rank
- Encourages writing optimized, efficient code

#### 3️⃣ **TIE-BREAKER 2: Problems Fully Solved**
- If still tied, the participant who **fully solved more problems** (passed ALL test cases) ranks higher
- Rewards complete solutions over partial ones

### Scoring Summary Table

| Rank | Test Cases Passed | Execution Time | Problems Solved | Result |
|------|-------------------|----------------|-----------------|--------|
| 🥇 1st | 18/20 | 380ms | 2/3 | Winner! |
| 🥈 2nd | 18/20 | 450ms | 2/3 | Tied on tests, slower |
| 🥉 3rd | 18/20 | 520ms | 2/3 | Tied on tests, slowest |
| 4th | 17/20 | 300ms | 1/3 | Fewer tests passed |
| 5th | 12/20 | 250ms | 0/3 | Fewest tests passed |

**Key Insight**: Test cases matter most! Participant 5 was fastest but ranked last due to fewer test cases passed.

---

## 📝 Submission Rules

### Multiple Submissions
- ✅ **Allowed**: You can submit multiple times for the same problem
- ✅ **Best Counts**: Only your **best submission** for each problem counts toward your score
- ✅ **Improvement Encouraged**: Keep optimizing and resubmitting to improve your rank

**What counts as "best"?**
1. Most test cases passed
2. If tied on test cases, fastest execution time

### Submission Evaluation
When you submit code, it is:
1. **Compiled/Interpreted** (checks for syntax errors)
2. **Run against ALL test cases** (including hidden ones)
3. **Timed** (execution time measured)
4. **Compared** (output vs expected output)

### Submission Statuses

| Status | Meaning | Points Awarded |
|--------|---------|----------------|
| ✅ **Accepted** | All test cases passed | Full points (all tests) |
| ❌ **Wrong Answer** | Some test cases failed | Partial points (only passed tests) |
| ⏰ **Time Limit Exceeded** | Code too slow | Points for tests passed before timeout |
| 💥 **Runtime Error** | Code crashed during execution | Points for tests passed before crash |
| 🔧 **Compilation Error** | Code won't compile/run | 0 points |

### Test Cases

#### **Public Test Cases** (Visible)
- Shown in problem description
- You can see input, expected output, and your actual output
- Use these to debug your solution

#### **Hidden Test Cases** (Secret)
- Not visible to participants
- Used to prevent hardcoded solutions
- You only see if you passed or failed
- Input/output details shown as `[Hidden]`

---

## 🔒 Security & Anti-Cheating Measures

### Fullscreen Lock Mode
- ✅ **Required**: Contest runs in mandatory fullscreen mode
- ⚠️ **Warning**: Exiting fullscreen will trigger automatic termination

### Tab Switching Detection
- ❌ **Prohibited**: Switching to other tabs/windows/applications
- ⚠️ **Penalty**: Automatic contest termination on first violation
- 🚨 **Detection**: System monitors tab visibility changes

### Copy-Paste Restrictions
- ❌ **Disabled**: Copy/paste operations are blocked during contest
- ❌ **No External Code**: Cannot paste code from outside sources
- ✅ **Allowed**: Ctrl+A (select all) and typing within editor

### Internet Access
- ⚠️ **Warning**: While technically possible, tab switching is monitored
- 🚨 **Risk**: Opening documentation/tutorials will trigger termination
- 💡 **Advice**: Prepare and study before starting the contest

### Code Monitoring
- 📹 **Logged**: All submissions are recorded with timestamps
- 🔍 **Review**: Contest hosts can review all submissions
- ⚠️ **Plagiarism**: Identical solutions may be flagged

---

## ⚙️ Technical Constraints

### Time Limits
- Each problem has a **time limit** (typically 2 seconds)
- Your code must complete execution within this limit
- Exceeding the limit results in **Time Limit Exceeded** status

### Memory Limits
- Each problem has a **memory limit** (typically 256 MB)
- Currently not enforced, but may be added in future

### Language Versions

| Language | Version | Compiler/Interpreter |
|----------|---------|---------------------|
| Python | 3.10.0 | CPython |
| C | 10.2.0 | GCC |
| C++ | 10.2.0 | G++ |
| Java | 15.0.2 | OpenJDK |
| JavaScript | 18.15.0 | Node.js |

### Code Execution Environment
- **Sandboxed**: Code runs in isolated environment (Piston API)
- **No File I/O**: Cannot read/write files
- **No Network**: Cannot make HTTP requests
- **Standard Input/Output**: Use stdin for input, stdout for output

---

## 🎮 During the Contest

### What You Can Do
- ✅ Read problem statements
- ✅ Write and test code
- ✅ Run code with custom input (uses "Run Code" button)
- ✅ Submit solutions (uses "Submit" button)
- ✅ View your submission history
- ✅ Check the leaderboard
- ✅ Switch between problems

### What You Cannot Do
- ❌ Exit fullscreen mode
- ❌ Switch tabs or applications
- ❌ Copy/paste code
- ❌ Access external resources
- ❌ Communicate with others
- ❌ View other participants' code
- ❌ Modify code after contest ends

### Run vs Submit

**"Run Code" Button:**
- Tests your code with custom input you provide
- Does NOT count toward your score
- Use this to debug and test your solution
- No submission record created

**"Submit" Button:**
- Runs your code against ALL test cases (public + hidden)
- Counts toward your score
- Creates a submission record
- Updates leaderboard
- **Use this when you're confident your solution is correct**

### Real-Time Information
During the contest, you can see:
- ⏱️ **Time Remaining**: Countdown timer at the top
- 📊 **Your Progress**: Which problems you've solved
- 🏆 **Leaderboard**: Current rankings (updates after each submission)
- 📝 **Submission History**: Your past attempts with results

---

## 🏁 Contest End

### Automatic Termination
The contest automatically ends when:
- ⏰ **Time Expires**: Contest duration reaches zero
- 🚨 **Violation Detected**: Security rule broken (tab switch, exit fullscreen)

### After Contest Ends
- 🔒 **Submissions Locked**: Cannot submit new solutions
- 📊 **Final Leaderboard**: Rankings are finalized
- 🏆 **Winners Announced**: Top 3 participants are highlighted
- 📝 **Results Available**: View your submissions and test results
- 🔍 **Review Mode**: Can review problems and your solutions

---

## 📚 Problem Guidelines

### Input/Output Format
- **Read Input**: Use standard input (stdin)
  - Python: `input()`
  - C/C++: `scanf()` or `cin`
  - Java: `Scanner`
  - JavaScript: Process command line input
  
- **Write Output**: Use standard output (stdout)
  - Python: `print()`
  - C/C++: `printf()` or `cout`
  - Java: `System.out.println()`
  - JavaScript: `console.log()`

### Output Comparison
- **Exact Match Required**: Your output must exactly match expected output
- **Case Insensitive**: Uppercase/lowercase doesn't matter
- **Whitespace Normalized**: Extra spaces/newlines are trimmed
- **Format Carefully**: Pay attention to output format in examples

### Problem Solving Tips
1. 📖 **Read Carefully**: Understand the problem statement and constraints
2. 📝 **Plan First**: Think about the approach before coding
3. 🧪 **Test Examples**: Verify your code works on sample inputs
4. 🔍 **Edge Cases**: Consider boundary conditions
5. ⚡ **Optimize**: Consider time complexity for large inputs
6. 🐛 **Debug**: Use "Run Code" to test with custom inputs
7. ✅ **Submit**: When confident, hit submit to get scored

---

## ⚠️ Important Warnings

### Before Starting Contest
- ⏰ **No Pause**: Cannot pause once started
- 🔒 **No Re-entry**: If you exit/violate rules, cannot rejoin
- 💾 **Auto-save**: Code is NOT automatically saved between sessions
- 📵 **Prepare**: Use bathroom, silence phone, close other apps

### Common Mistakes to Avoid
- ❌ Don't hardcode outputs for test cases
- ❌ Don't submit without testing first
- ❌ Don't ignore time/space complexity
- ❌ Don't forget to handle edge cases
- ❌ Don't exit fullscreen (immediate termination!)
- ❌ Don't switch tabs (immediate termination!)

### If Something Goes Wrong
- 🔄 **Refresh**: If page freezes, refresh (but risk violation)
- 📝 **Note**: System logs all activity with timestamps
- 📧 **Report**: Contact contest host for technical issues after contest
- ⚠️ **No Excuse**: Technical issues are participant's responsibility

---

## 🎯 Contest Etiquette

### Fair Play
- 🤝 **Individual Work**: Solve problems on your own
- 🚫 **No Collaboration**: Don't discuss solutions during contest
- 📵 **No Communication**: Don't contact other participants
- 🎓 **Learn**: Use contest as learning opportunity

### After Contest
- 💬 **Discussion Welcome**: Share approaches and learn from others
- 🤝 **Help Others**: Explain your solutions if asked
- 📈 **Improve**: Analyze what you could have done better
- 🔄 **Practice**: Keep solving problems to improve

---

## 📊 Statistics Tracked

For each participant, the system tracks:
- ✅ Total test cases passed
- ⏱️ Total execution time
- 🎯 Problems fully solved
- 📝 Number of submissions per problem
- 🕐 Timestamp of each submission
- 💯 Final score/points

---

## 🔮 Future Updates

Potential features being considered:
- 📊 Partial scoring improvements
- 🔍 Plagiarism detection
- 📊 Detailed analytics after contest
- 🏅 Badges and achievements
- 📜 Certificates for top performers
- 🎥 Video proctoring

---

## ❓ FAQ

**Q: Can I use my own IDE?**
A: No, must use the provided in-browser editor.

**Q: What happens if my internet disconnects?**
A: Contest continues running. Reconnect quickly to avoid timeout. No extensions given.

**Q: Can I submit after time runs out?**
A: No, submissions are locked when contest ends.

**Q: Do I get points for partially correct solutions?**
A: Yes! You get credit for each test case you pass.

**Q: How do I know if I'm winning?**
A: Check the leaderboard tab to see current rankings.

**Q: Can I see other people's code?**
A: No, all code is private during and after contest.

**Q: What if two people have identical scores?**
A: Tie-breaker 1 is execution time, tie-breaker 2 is problems fully solved.

**Q: Can I leave and come back?**
A: No! Once you start, must stay until end or forfeit.

**Q: Are there penalties for wrong submissions?**
A: No penalties currently. Only your best submission counts.

**Q: Can I ask questions during contest?**
A: No, problem statements are final. No clarifications during contest.

---

## 📞 Support

For issues or questions:
- **Before Contest**: Contact contest host
- **During Contest**: No support available (would violate rules)
- **After Contest**: Review results and contact host if needed

---

## ✅ Checklist Before Starting

Before clicking "Start Contest", make sure:
- [ ] You understand the ranking system (test cases → time → problems solved)
- [ ] You've read the security rules (fullscreen, no tab switching)
- [ ] You understand this is a ONE-TIME attempt (no re-entry)
- [ ] You're in a quiet environment with stable internet
- [ ] You've silenced your phone and closed other apps
- [ ] You're prepared for the full contest duration
- [ ] You understand copy/paste is disabled
- [ ] You've used the bathroom and have water nearby
- [ ] You're ready to code in fullscreen for the entire duration

---

## 🏆 Good Luck!

Remember:
- **Test cases passed** is most important
- **Speed matters** when tied
- **Partial credit** is better than no credit
- **Stay calm** and **think logically**
- **Have fun** and **learn** from the experience!

May the best coder win! 🚀
