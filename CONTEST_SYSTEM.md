# Private Contest System Documentation

## Overview
The Private Contest system allows users to create and join competitive programming contests with restricted access through unique join codes.

## Architecture

### Components

1. **Sidebar Navigation** (`src/components/Sidebar.tsx`)
   - Collapsible "Contests" section
   - "Private Contests" navigation item
   - Uses Next.js router for navigation

2. **Private Contests Page** (`src/app/dashboard/contests/private/page.tsx`)
   - Main entry point for contest actions
   - Displays created and joined contests
   - Action buttons for create/join operations

3. **CreateContestModal** (`src/components/CreateContestModal.tsx`)
   - Form for creating new private contests
   - Validates start/end times
   - Returns join code on success

4. **JoinContestModal** (`src/components/JoinContestModal.tsx`)
   - Input for 8-character join code
   - Real-time validation
   - Join contest functionality

5. **ContestCard** (`src/components/ContestCard.tsx`)
   - Displays contest information
   - Shows status (upcoming/live/ended)
   - Copy join code (for creators)
   - Action buttons based on status

6. **JoinCodeSuccessDialog** (`src/components/JoinCodeSuccessDialog.tsx`)
   - Displays join code after contest creation
   - Copy to clipboard functionality
   - Usage instructions

### Backend

#### API Routes

1. **POST /api/contests/create**
   - Creates a new private contest
   - Generates unique 8-character join code
   - Automatically adds creator as participant
   - Returns contest details and join code

2. **POST /api/contests/join**
   - Validates join code
   - Checks contest eligibility
   - Adds user to participants
   - Enforces all business rules

3. **GET /api/contests/my-contests**
   - Returns all contests for current user
   - Includes created and joined contests
   - Updates contest status dynamically

4. **POST /api/contests/validate**
   - Validates join code without joining
   - Returns minimal contest info
   - Used for pre-join validation

#### Database (`src/lib/contestDb.ts`)
- In-memory storage (for demo purposes)
- Maps join codes to contest IDs
- Rate limiting on join attempts
- Automatic cleanup of expired codes

### Data Types (`src/lib/contest.ts`)

```typescript
type ContestStatus = 'upcoming' | 'live' | 'ended';

interface Contest {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: ContestStatus;
  joinCode: string;
  creatorId: string;
  createdAt: string;
  participants: Participant[];
  participantLimit?: number;
}
```

## Business Rules

### Contest Creation
- ✅ Contest name is required
- ✅ Start time must be in the future
- ✅ End time must be after start time
- ✅ Unique 8-character join code generated
- ✅ Creator automatically added as participant
- ✅ Contest status set to "upcoming"

### Joining Contests
- ✅ Join code must be valid (8 characters)
- ✅ Contest must exist
- ✅ Contest status must be upcoming or live
- ✅ User cannot join twice
- ✅ Participant limits respected (if set)
- ✅ Rate limiting enforced (5 attempts per minute)

### Contest States
1. **Upcoming**: Before start time
   - Join allowed
   - Join code visible to creator
   - No contest actions available

2. **Live**: Between start and end time
   - Join allowed (configurable)
   - "Enter Contest" button active
   - Contest content accessible

3. **Ended**: After end time
   - No joining allowed
   - Join codes expired
   - Read-only results view

### Access Control
- Before joining: Contest details hidden
- After joining: Full access to contest
- Creator privileges: View and share join code
- Security: All validation server-side

### Abuse Prevention
- ✅ Rate limiting on join attempts
- ✅ Join code validation server-side only
- ✅ Unique join codes (no duplicates)
- ✅ Invalid code tracking
- ✅ No admin privileges from join code

## User Flow

### Creating a Contest
1. Navigate to Sidebar → Contests → Private Contests
2. Click "Create New Contest"
3. Fill in contest details:
   - Contest name
   - Start date/time
   - End date/time
4. Submit form
5. Receive join code in success dialog
6. Share join code with participants

### Joining a Contest
1. Navigate to Sidebar → Contests → Private Contests
2. Click "Join with Code"
3. Enter 8-character join code
4. Submit form
5. Contest appears in "Joined Contests"

### Managing Contests
- View all created contests in "My Created Contests"
- View all joined contests in "Joined Contests"
- Copy join code from contest card (creators only)
- Enter live contests when they start
- View results after contests end

## Testing

### Sample Test Flow
1. Create a contest with future start time
2. Copy the join code
3. (In production) Share with another user
4. Join with the code
5. Verify contest appears in both lists
6. Wait for contest to go live
7. Enter contest and participate

### Error Cases to Test
- Invalid join code
- Expired contest
- Duplicate join attempt
- Past start time
- Invalid date range
- Rate limiting

## Future Enhancements
- Real authentication system
- Persistent database storage
- Email notifications
- Contest problems and submissions
- Real-time leaderboards
- Contest templates
- Team contests
- Contest invitations

## Security Considerations
- All validation on server-side
- Join codes never trusted from client
- Rate limiting prevents brute force
- Contest details hidden until joined
- User authentication required (when implemented)
