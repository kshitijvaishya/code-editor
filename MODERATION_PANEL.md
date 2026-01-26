# Contest Moderation Panel

## Overview
A comprehensive moderation panel has been added that allows contest hosts (creators) to view all participant submissions, including their code, for each problem in the contest.

## Features Implemented

### 1. API Route for Submissions
**File:** `src/app/api/contests/submissions/route.ts`

- **Endpoint:** POST `/api/contests/submissions`
- **Authentication:** Requires user to be logged in
- **Authorization:** Only the contest creator can access submissions
- **Returns:**
  - Contest information
  - List of all problems in the contest
  - All participants with their:
    - Score and problems solved
    - Submissions grouped by problem
    - Best submission for each problem
    - Complete code for each submission

### 2. Moderation Page
**File:** `src/app/contest/[id]/moderate/page.tsx`

#### Features:
- **Two View Modes:**
  1. **By Participants:** Groups submissions by participant, showing all their attempts for each problem
  2. **By Problems:** Groups submissions by problem, showing all participants' attempts for each problem

- **Participant View:**
  - Expandable cards for each participant
  - Shows participant stats (score, problems solved, total submissions)
  - Displays all submissions for each problem
  - Color-coded submission status (Accepted, Wrong Answer, etc.)

- **Problem View:**
  - One card per problem
  - Shows all submissions across all participants
  - Displays problem difficulty and points

- **Code Viewer Modal:**
  - Click "View Code" button on any submission
  - Opens a modal with syntax-highlighted code
  - Shows submission details (status, test results, language, timestamp)

#### Statistics Dashboard:
- Total submissions count
- Total participants count
- Real-time contest status

### 3. Navigation to Moderation Panel
**Updated File:** `src/app/contest/[id]/page.tsx`

- Added "Moderation Panel" button visible only to contest hosts
- Button appears in two places:
  1. On the contest welcome/instructions page (before starting)
  2. In the live contest header (during contest)
- Uses Shield icon to indicate admin functionality
- Current user is fetched to determine if they are the host

## How It Works

### Access Control
1. When a user views a contest, the system fetches their user data
2. Compares `currentUser.userId` with `contest.creatorId`
3. Only shows moderation button if user is the creator
4. API endpoint also validates creator status before returning data

### Data Structure
Submissions are organized hierarchically:
```
Contest
├── Participant 1
│   ├── Problem A
│   │   ├── Submission 1 (with code)
│   │   ├── Submission 2 (with code)
│   │   └── Best Submission
│   └── Problem B
│       └── Submissions...
└── Participant 2
    └── ...
```

### Submission Details Shown
For each submission:
- ✓ Participant username
- ✓ Problem title and difficulty
- ✓ Submission status (Accepted, Wrong Answer, etc.)
- ✓ Tests passed (e.g., 5/10)
- ✓ Programming language used
- ✓ Execution time (if available)
- ✓ Points earned
- ✓ Submission timestamp
- ✓ **Complete source code**

## Usage

### For Contest Hosts:
1. Navigate to any contest you created
2. Click the "Moderation Panel" button (Shield icon)
3. Choose view mode:
   - **By Participants:** See each participant's complete submission history
   - **By Problems:** See all submissions for a specific problem
4. Click "View Code" on any submission to see the complete source code
5. Monitor all participant activity in real-time

### Security:
- ✓ Only contest creators can access the moderation panel
- ✓ API validates creator status on every request
- ✓ Unauthorized users receive 403 Forbidden error
- ✓ All code submissions are stored securely

## UI/UX Features

### Color Coding:
- 🟢 **Green:** Accepted submissions
- 🔴 **Red:** Wrong Answer / Compilation Error
- 🟠 **Orange:** Time Limit Exceeded
- 🟣 **Purple:** Runtime Error
- 🟡 **Yellow:** Other errors

### Responsive Design:
- Expandable/collapsible participant cards
- Tabbed view for switching between modes
- Modal overlay for code viewing
- Smooth transitions and hover effects

### Information Display:
- Real-time contest statistics
- Participant rankings and scores
- Submission history with timestamps
- Code syntax preservation in viewer

## Technical Implementation

### Technologies Used:
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **MongoDB** for data persistence
- **Lucide React** for icons
- **Tailwind CSS** for styling

### Key Components:
1. **API Route:** Handles data fetching and authorization
2. **Moderation Page:** React component with state management
3. **Contest Page:** Updated with host detection and navigation

## Benefits

For Contest Hosts:
- 👁️ **Full Visibility:** See every submission from every participant
- 📊 **Analytics:** Track participant progress and performance
- 🔍 **Code Review:** Examine submissions for learning or evaluation
- 📈 **Real-time Monitoring:** Watch submissions as they come in
- 🎯 **Problem-specific View:** See how participants approach each problem

For Contest Integrity:
- ✅ Helps detect plagiarism
- ✅ Allows for manual review if needed
- ✅ Provides transparency in scoring
- ✅ Enables post-contest analysis

## Future Enhancements (Suggestions)

1. **Export Functionality:** Download submissions as CSV/JSON
2. **Filtering:** Filter by status, language, or time range
3. **Comparison View:** Compare two submissions side-by-side
4. **Analytics Dashboard:** Charts showing submission trends
5. **Comments/Feedback:** Allow hosts to add notes on submissions
6. **Email Notifications:** Alert hosts when new submissions arrive
7. **Plagiarism Detection:** Automated similarity checking
8. **Bulk Actions:** Select and download multiple submissions

## Files Modified/Created

### New Files:
1. `src/app/api/contests/submissions/route.ts` - API endpoint
2. `src/app/contest/[id]/moderate/page.tsx` - Moderation panel UI

### Modified Files:
1. `src/app/contest/[id]/page.tsx` - Added navigation buttons

### Existing Files Used:
- `src/lib/contestDb.ts` - Database operations
- `src/lib/contest.ts` - Type definitions
- `src/lib/auth.ts` - Authentication
- `src/lib/problems.ts` - Problem data

## Testing Checklist

- [ ] Create a contest as a user
- [ ] Join the contest as another user
- [ ] Submit code to problems
- [ ] As contest creator, click "Moderation Panel"
- [ ] Verify only host sees the button
- [ ] Switch between "By Participants" and "By Problems" views
- [ ] Click "View Code" to see submission details
- [ ] Verify all submission data is displayed correctly
- [ ] Test access control (non-hosts should get 403 error)

## Conclusion

The moderation panel provides contest hosts with complete oversight of all participant activities, making it easy to monitor, review, and analyze submissions. The intuitive interface allows for quick navigation between participants and problems, with full code visibility for every submission.
