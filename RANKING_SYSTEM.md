# Contest Ranking & Leaderboard System

## How Winners Are Determined (1st, 2nd, 3rd Place)

Your contest platform uses an **automated leaderboard system** that ranks participants based on **test cases passed** and **execution time**. This gives **partial credit** for solving some test cases even if not all pass.

---

## 📊 Ranking Algorithm

### Implemented in: [contestDb.ts](src/lib/contestDb.ts#L227-L247)

```typescript
async getContestLeaderboard(contestId: string): Promise<Participant[]> {
  const contest = await this.getContestById(contestId);
  if (!contest) return [];

  // Sort participants by:
  // 1. Total test cases passed (highest first) - PRIMARY
  // 2. Total execution time (lowest first) - TIE-BREAKER
  // 3. Problems solved (most first) - SECONDARY TIE-BREAKER
  return [...contest.participants].sort((a, b) => {
    // Primary: Most test cases passed
    if ((b.totalTestsPassed || 0) !== (a.totalTestsPassed || 0)) {
      return (b.totalTestsPassed || 0) - (a.totalTestsPassed || 0);
    }
    // Tie-breaker 1: Lowest execution time (faster is better)
    if ((a.totalExecutionTime || 0) !== (b.totalExecutionTime || 0)) {
      return (a.totalExecutionTime || 0) - (b.totalExecutionTime || 0);
    }
    // Tie-breaker 2: Most problems solved
    return (b.problemsSolved || 0) - (a.problemsSolved || 0);
  });
}
```

### **Ranking Criteria** (in order of priority):

1. **🥇 PRIMARY: Total Test Cases Passed**
   - Participant who passed the **most test cases** across all problems ranks first
   - Even partial solutions count! (3/5 test cases = 3 points)
   - This rewards participants who make progress on difficult problems

2. **⚡ TIE-BREAKER 1: Total Execution Time**
   - If two participants passed the same number of test cases, the **faster one** ranks higher
   - Lower execution time = Better rank
   - Encourages optimized, efficient solutions

3. **🎯 TIE-BREAKER 2: Problems Fully Solved**
   - If still tied, the one who **fully solved more problems** ranks higher
   - Rewards complete solutions over partial ones

---

## 🏆 How Positions Are Determined

### **1st Place (Gold 🥇)**
- Participant with **most test cases passed** across all problems
- Or if tied, the one with **lowest total execution time** (fastest)

### **2nd Place (Silver 🥈)**
- Participant with **second-most test cases passed**
- Or second-fastest if tied on test cases

### **3rd Place (Bronze 🥉)**
- Participant with **third-most test cases passed**
- Or third-fastest if tied on test cases

---

## 📈 Score Calculation & Tracking

### Participant Data Structure: [contest.ts](src/lib/contest.ts)

```typescript
export interface Participant {
  userId: string;
  username: string;
  joinedAt: string;
  score?: number;                    // Total points earned (for display)
  problemsSolved?: number;           // Count of fully solved problems
  totalTestsPassed?: number;         // PRIMARY METRIC: Sum of all test cases passed
  totalExecutionTime?: number;       // TIE-BREAKER: Sum of execution times (ms)
}
```

### When a submission is made: [contestDb.ts](src/lib/contestDb.ts)

```typescript
// Update participant stats (partial credit for test cases passed)
const participant = contest.participants.find(p => p.userId === userId);
if (participant) {
  // Check if this is user's best attempt for this problem
  const previousSubmissions = contest.submissions?.filter(
    s => s.userId === userId && s.problemId === problemId
  ) || [];
  
  // Find best previous submission for this problem
  const bestPrevious = previousSubmissions.reduce((best, curr) => {
    if (!best) return curr;
    if (curr.testsPassed > best.testsPassed) return curr;
    if (curr.testsPassed === best.testsPassed && 
        (curr.executionTime || 0) < (best.executionTime || 0)) return curr;
    return best;
  }, null);

  // Calculate improvement in test cases passed
  const prevTestsPassed = bestPrevious?.testsPassed || 0;
  const testCaseImprovement = testsPassed - prevTestsPassed;
  
  // Calculate improvement in execution time
  const prevExecutionTime = bestPrevious?.executionTime || 0;
  const timeImprovement = testCaseImprovement >= 0 ? prevExecutionTime - executionTime : 0;

  // Update stats (only count improvements)
  await collection.updateOne(
    { id: contestId, 'participants.userId': userId },
    { 
      $inc: { 
        'participants.$.totalTestsPassed': testCaseImprovement,
        'participants.$.totalExecutionTime': timeImprovement,
        'participants.$.problemsSolved': isNewlySolved ? 1 : 0
      }
    }
  );
}
```

### **Scoring Rules:**

1. **Partial Credit for Test Cases**
   - Pass 3 out of 5 test cases → Get credit for 3 test cases
   - Pass 5 out of 5 test cases → Get credit for 5 test cases
   - Every test case counts toward your total!

2. **Only Best Submission Counts**
   - If you submit multiple times for the same problem, only your **best attempt** counts
   - Best = Most test cases passed, then fastest execution time
   - Example: Submit 3 times (2/5 pass, 4/5 pass, 3/5 pass) → Only 4/5 counts

3. **Execution Time Accumulates**
   - Your total execution time = Sum of execution times from your best submission for each problem
   - Faster solutions give you an advantage in tie-breaking

4. **Multiple Submissions Encouraged**
   - Keep improving! If you pass more test cases, your rank improves
   - Optimize for speed to beat tied competitors

---

## 🖥️ Leaderboard Display

### Where: [contest/[id]/page.tsx](src/app/contest/[id]/page.tsx)

```tsx
<table className="w-full">
  <thead>
    <tr>
      <th>Rank</th>
      <th>Username</th>
      <th>Test Cases</th>      {/* NEW: Primary metric */}
      <th>Time (ms)</th>        {/* NEW: Tie-breaker */}
      <th>Solved</th>
    </tr>
  </thead>
  <tbody>
    {leaderboard.map((participant, index) => (
      <tr key={participant.userId} className={index < 3 ? 'bg-gray-800/50' : ''}>
        <td>
          <span className={`font-bold ${
            index === 0 ? 'text-yellow-400' :      // 🥇 1st Place - Gold
            index === 1 ? 'text-gray-300' :        // 🥈 2nd Place - Silver
            index === 2 ? 'text-orange-400' :      // 🥉 3rd Place - Bronze
            'text-gray-400'                         // Others
          }`}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''} #{index + 1}
          </span>
        </td>
        <td>{participant.username}</td>
        <td className="text-green-400">{participant.totalTestsPassed || 0}</td>
        <td className="text-blue-400">{(participant.totalExecutionTime || 0).toFixed(0)}</td>
        <td>{participant.problemsSolved || 0}/{problems.length}</td>
      </tr>
    ))}
  </tbody>
</table>

{/* Ranking Explanation */}
<div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
  <h3>🏆 How Rankings Work</h3>
  <ul>
    <li>1. <strong>Test Cases Passed:</strong> More test cases = Higher rank (partial credit)</li>
    <li>2. <strong>Execution Time:</strong> If tied on test cases, faster solutions rank higher</li>
    <li>3. <strong>Problems Solved:</strong> If still tied, fully solved problems decide</li>
  </ul>
</div>
```

### **Visual Indicators:**
- **Rank #1**: 🥇 + Yellow/Gold color
- **Rank #2**: 🥈 + Silver/Gray color
- **Rank #3**: 🥉 + Orange/Bronze color
- **Top 3**: Highlighted with background color
- **Test Cases**: Green color (primary metric)
- **Execution Time**: Blue color (tie-breaker)

---

## 📊 Example Scenario

**Contest**: "Weekly DSA Challenge"
- 3 problems: Two Sum (5 tests), Valid Parentheses (7 tests), Maximum Subarray (8 tests)
- Total possible test cases: 20
- 5 participants

### **Submissions:**

| Participant | Two Sum | Valid Parens | Max Subarray | **Total Tests** | **Total Time** | **Fully Solved** |
|-------------|---------|--------------|--------------|-----------------|----------------|------------------|
| Alice       | 5/5 ✅  | 7/7 ✅       | 6/8 ⚠️       | **18/20**       | 450ms          | 2/3              |
| Bob         | 5/5 ✅  | 7/7 ✅       | 6/8 ⚠️       | **18/20**       | 520ms          | 2/3              |
| Charlie     | 5/5 ✅  | 5/7 ⚠️       | 8/8 ✅       | **18/20**       | 380ms          | 2/3              |
| Diana       | 4/5 ⚠️  | 7/7 ✅       | 6/8 ⚠️       | **17/20**       | 300ms          | 1/3              |
| Eve         | 3/5 ⚠️  | 4/7 ⚠️       | 5/8 ⚠️       | **12/20**       | 250ms          | 0/3              |

### **Final Leaderboard:**

1. **🥇 Charlie** - 18 tests, 380ms → **1st Place** (Same tests as Alice & Bob, but fastest!)
2. **🥈 Alice** - 18 tests, 450ms → **2nd Place** (Same tests, 2nd fastest)
3. **🥉 Bob** - 18 tests, 520ms → **3rd Place** (Same tests, 3rd fastest)
4. Diana - 17 tests, 300ms → 4th (Fewer test cases passed)
5. Eve - 12 tests, 250ms → 5th (Even though fastest, passed fewest tests)

### **Key Insights:**

- **Alice, Bob, and Charlie** all passed 18 test cases, so tie-breaker (execution time) decides their ranks
- **Charlie wins** despite not solving the most problems, because he passed same number of tests in least time
- **Eve** had the fastest code but passed the fewest tests, so ranks last
- **Test cases are primary** - Diana passed 17 tests vs Eve's 12, so Diana ranks higher even though Eve was faster

---

## 🔄 Real-Time Updates

The leaderboard updates automatically:

1. **User submits code** → API validates against test cases
2. **If Accepted** → Score and problemsSolved incremented in database
3. **Frontend refreshes** → Calls `loadContestData()` to fetch updated leaderboard
4. **Leaderboard re-sorts** → Shows latest rankings

### Auto-refresh triggers:
- After each submission
- When viewing leaderboard tab
- Manual page refresh

---

## 🎯 API Endpoint

### GET `/api/contests/details?id={contestId}`

**Returns:**
```json
{
  "success": true,
  "contest": { ... },
  "leaderboard": [
    {
      "userId": "user123",
      "username": "Alice",
      "score": 400,
      "problemsSolved": 3,
      "joinedAt": "2026-01-25T10:00:00Z"
    },
    {
      "userId": "user456",
      "username": "Bob",
      "score": 300,
      "problemsSolved": 2,
      "joinedAt": "2026-01-25T10:05:00Z"
    }
    // ... sorted by rank
  ]
}
```

---

## 🔮 Future Enhancements

### Potential Improvements:

1. **Advanced Tie-Breaking:**
   ```typescript
   // Add submission time as tie-breaker
   .sort((a, b) => {
     if ((b.score || 0) !== (a.score || 0)) {
       return (b.score || 0) - (a.score || 0);
     }
     if ((b.problemsSolved || 0) !== (a.problemsSolved || 0)) {
       return (b.problemsSolved || 0) - (a.problemsSolved || 0);
     }
     // NEW: Earliest solver wins
     return new Date(a.lastSubmissionTime).getTime() - new Date(b.lastSubmissionTime).getTime();
   });
   ```

2. **Penalty System:**
   - Deduct points for wrong submissions
   - Add time penalties for each incorrect attempt

3. **Badges & Achievements:**
   - Award badges for 1st/2nd/3rd place
   - Special achievements (fastest solver, perfect score, etc.)

4. **Detailed Statistics:**
   - Show submission history per problem
   - Display submission times and attempt counts
   - Time taken to solve each problem

5. **Live Leaderboard:**
   - WebSocket-based real-time updates
   - No manual refresh needed

6. **Export Results:**
   - Download leaderboard as CSV/PDF
   - Generate certificates for top 3

---

## 🔐 Security Considerations

- Leaderboard is **read-only** during contest
- Participants can only see:
  - Usernames
  - Scores
  - Problems solved count
- **Cannot see:**
  - Other participants' code
  - Detailed submission results of others
  - Hidden test cases

---

## Summary

**To determine 1st, 2nd, and 3rd place:**

1. System automatically sorts participants by **total test cases passed** (most first) ✅
2. If test cases are tied, sorts by **total execution time** (fastest first) ⚡
3. If still tied, sorts by **problems fully solved** (most first) 🎯
4. Top 3 in sorted list are your winners 🏆
5. Leaderboard updates in real-time after each submission 🔄

**Key Features:**
- ✅ **Partial Credit**: Even failing some tests gives you credit for the ones you passed
- ⚡ **Speed Matters**: Faster solutions break ties
- 🔄 **Always Improving**: Submit multiple times - only your best attempt counts
- 📊 **Fair & Transparent**: Clear metrics shown on leaderboard

**The ranking happens automatically** - no manual intervention needed. Participants compete on test cases passed first, execution speed second!
