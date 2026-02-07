# Contest Timezone System - Implementation Guide

## Overview

This document describes the timezone-safe implementation of the contest timing system. All contest times are stored in **UTC only** and dynamically computed to ensure correct behavior across all timezones and server locations.

---

## Core Architecture Principles

### 1. **UTC-Only Storage**
- All contest timestamps (`startTime`, `endTime`, `createdAt`, `joinedAt`, `submittedAt`) are stored as **UTC ISO 8601 strings**
- Format: `2024-01-15T10:30:00.000Z`
- The trailing `Z` indicates UTC timezone
- **Never store local time or timezone-specific strings**

### 2. **Dynamic Status Computation**
- Contest status (`upcoming`, `live`, `ended`) is **NEVER stored in the database**
- Status is computed dynamically using UTC time comparisons whenever a contest is retrieved
- This ensures correct status regardless of server timezone or DST changes

### 3. **Frontend Timezone Display**
- User-selected times in the UI are converted to UTC before sending to backend
- Stored UTC times are converted to user's local timezone for display only
- JavaScript's `Date` object automatically handles timezone conversions

---

## Implementation Details

### Backend (UTC Time Comparisons)

#### Contest Status Computation
```typescript
// src/lib/contest.ts
export function getContestStatus(startTime: string, endTime: string): ContestStatus {
  const now = new Date(); // Current UTC time
  const start = new Date(startTime); // Parse UTC ISO string
  const end = new Date(endTime); // Parse UTC ISO string

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}
```

**Key Points:**
- `new Date()` returns UTC time when comparing Date objects
- All input strings must be UTC ISO format
- No manual timezone adjustments needed

#### Database Schema
```typescript
// src/lib/contest.ts
export interface StoredContest {
  id: string;
  name: string;
  startTime: string;   // UTC ISO: "2024-01-15T10:30:00.000Z"
  endTime: string;     // UTC ISO: "2024-01-15T12:30:00.000Z"
  createdAt: string;   // UTC ISO
  // NO status field - computed dynamically
}

export interface Contest extends StoredContest {
  status: ContestStatus; // Computed on retrieval, never stored
}
```

#### API Validation
```typescript
// src/app/api/contests/create/route.ts
import { isValidUTCTimestamp } from '@/lib/contest';

// Validate incoming timestamps
if (!isValidUTCTimestamp(startTime)) {
  return NextResponse.json(
    { success: false, message: 'Start time must be in UTC ISO format' },
    { status: 400 }
  );
}

// All time comparisons in UTC
const start = new Date(startTime);
const end = new Date(endTime);
const now = new Date(); // This is UTC

if (start < now) {
  return NextResponse.json(
    { success: false, message: 'Start time cannot be in the past' },
    { status: 400 }
  );
}
```

#### Submission Validation
```typescript
// src/lib/contestDb.ts
async submitSolution(...) {
  const contest = await this.getContestById(contestId);
  
  // Dynamically compute status - never use stored status
  const contestStatus = getContestStatus(contest.startTime, contest.endTime);
  
  if (contestStatus !== 'live') {
    return { 
      success: false, 
      message: `Contest is not active. Current status: ${contestStatus}` 
    };
  }
  
  // Record submission with UTC timestamp
  const submission = {
    ...otherFields,
    submittedAt: new Date().toISOString() // UTC ISO format
  };
}
```

---

### Frontend (Local Time Display)

#### Creating Contests
```typescript
// src/components/CreateContestModal.tsx

// User inputs local time via datetime-local input
const [startTime, setStartTime] = useState(''); // Local format
const [endTime, setEndTime] = useState('');     // Local format

const handleSubmit = async (e: React.FormEvent) => {
  // Convert local time to UTC ISO before sending
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startTimeUTC = start.toISOString(); // Converts to UTC
  const endTimeUTC = end.toISOString();
  
  await fetch('/api/contests/create', {
    method: 'POST',
    body: JSON.stringify({
      startTime: startTimeUTC,  // Send UTC ISO string
      endTime: endTimeUTC
    })
  });
};
```

**Key Points:**
- `datetime-local` input gives local time string
- `new Date(localString)` interprets as local time
- `.toISOString()` converts to UTC format with `Z` suffix
- Backend receives proper UTC ISO string

#### Displaying Contest Times
```typescript
// src/app/contest/[id]/page.tsx

// Display UTC time in user's local timezone
<span>{new Date(contest.startTime).toLocaleString()}</span>
<span>{new Date(contest.endTime).toLocaleString()}</span>

// Or use custom formatter
import { formatDateTime } from '@/lib/contest';
<span>{formatDateTime(contest.startTime)}</span>
```

**Key Points:**
- `.toLocaleString()` automatically converts UTC to user's timezone
- No manual timezone math needed
- Browser handles DST and timezone rules

#### Client-Side Status Computation
```typescript
// Contest page status update
const now = new Date(); // Current UTC time
const start = new Date(contestData.startTime); // Parse UTC string
const end = new Date(contestData.endTime);

if (now < start) {
  contestData.status = 'upcoming';
} else if (now >= start && now <= end) {
  contestData.status = 'live';
} else {
  contestData.status = 'ended';
}
```

---

## Timezone Utilities

### Core Functions

#### `isValidUTCTimestamp(timestamp: string): boolean`
```typescript
// Validates UTC ISO format: "2024-01-15T10:30:00.000Z"
const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
return isoRegex.test(timestamp) && !isNaN(new Date(timestamp).getTime());
```

#### `formatUTCInLocalTimezone(utcISO: string): string`
```typescript
// Display UTC time in user's browser timezone
const date = new Date(utcISO);
return date.toLocaleString('en-US', { /* options */ });
```

#### `getCurrentUTC(): string`
```typescript
// Get current UTC time as ISO string
return new Date().toISOString();
```

See `src/lib/timezone.ts` for complete utility functions.

---

## Migration Guide

If you have existing contests with non-UTC timestamps, run this migration:

```typescript
// Example migration script
async function migrateContestTimestamps() {
  const db = await getDatabase();
  const contests = await db.collection('contests').find({}).toArray();
  
  for (const contest of contests) {
    // If stored in IST or other timezone, convert to UTC
    const startUTC = new Date(contest.startTime).toISOString();
    const endUTC = new Date(contest.endTime).toISOString();
    
    await db.collection('contests').updateOne(
      { _id: contest._id },
      { 
        $set: { 
          startTime: startUTC, 
          endTime: endUTC 
        },
        $unset: { status: "" } // Remove stored status field
      }
    );
  }
}
```

---

## Testing Timezone Behavior

### Test Case 1: User in India (IST = UTC+5:30)
- User selects: Jan 15, 2024, 4:00 PM IST
- Frontend converts: `2024-01-15T10:30:00.000Z` (UTC)
- Stored in DB: `2024-01-15T10:30:00.000Z`
- Backend compares: UTC time vs UTC time ✅
- Display to user: Shown as 4:00 PM IST ✅

### Test Case 2: Server in US (PST = UTC-8)
- Contest starts: `2024-01-15T10:30:00.000Z` (UTC)
- Server time: `new Date()` → Returns UTC ✅
- Comparison: UTC vs UTC ✅
- Status: Correctly computed regardless of server location ✅

### Test Case 3: Daylight Saving Time Change
- Contest spans DST change (e.g., March 10, 2024 in US)
- All times in UTC → No DST issues ✅
- Display: Browser handles DST conversion ✅

---

## Common Pitfalls to Avoid

### ❌ **Never Do This**
```typescript
// WRONG: Storing local time
const startTime = '2024-01-15 16:00'; // No timezone info!

// WRONG: Manual timezone offset
const istTime = new Date(utcTime.getTime() + (5.5 * 60 * 60 * 1000));

// WRONG: Using server's local time
const now = new Date().toLocaleString('en-IN'); // Returns local string

// WRONG: Storing status in database
await db.contests.updateOne({ id }, { $set: { status: 'live' } });
```

### ✅ **Correct Approach**
```typescript
// CORRECT: Use UTC ISO format
const startTime = '2024-01-15T10:30:00.000Z';

// CORRECT: Let Date handle conversions
const displayTime = new Date(utcTime).toLocaleString();

// CORRECT: Use UTC for comparisons
const now = new Date(); // UTC
const isLive = now >= start && now <= end;

// CORRECT: Compute status dynamically
const status = getContestStatus(startTime, endTime);
```

---

## Summary Checklist

- [x] All database timestamps are UTC ISO strings with `Z` suffix
- [x] No `status` field stored in database
- [x] `getContestStatus()` computes status dynamically using UTC comparison
- [x] Backend validates incoming timestamps are UTC ISO format
- [x] Frontend converts user input to UTC before sending to API
- [x] Frontend displays UTC times in user's local timezone
- [x] No manual timezone offsets or DST handling code
- [x] Works correctly across all server locations and user timezones

---

## References

- **ISO 8601**: https://en.wikipedia.org/wiki/ISO_8601
- **JavaScript Date**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- **IANA Timezones**: https://www.iana.org/time-zones

---

**Last Updated**: February 7, 2026
**Implementation Status**: ✅ Complete
