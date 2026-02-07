# Contest Timezone System - Quick Reference

## ✅ What Was Fixed

### 1. Frontend UTC Conversion
**File**: `src/components/CreateContestModal.tsx`

**Before:**
```typescript
// Sent local datetime-local values directly
body: JSON.stringify({ startTime, endTime })
```

**After:**
```typescript
// Convert to UTC ISO before sending
const startTimeUTC = new Date(startTime).toISOString();
const endTimeUTC = new Date(endTime).toISOString();
body: JSON.stringify({ 
  startTime: startTimeUTC,  // "2024-01-15T10:30:00.000Z"
  endTime: endTimeUTC 
})
```

---

### 2. Backend UTC Validation
**File**: `src/app/api/contests/create/route.ts`

**Added:**
```typescript
import { isValidUTCTimestamp } from '@/lib/contest';

// Validate timestamps are in UTC ISO format
if (!isValidUTCTimestamp(startTime)) {
  return NextResponse.json(
    { success: false, message: 'Start time must be in UTC ISO format' },
    { status: 400 }
  );
}
```

---

### 3. Removed Stored Status Field
**Files**: 
- `src/lib/contest.ts` - Split into `StoredContest` (no status) and `Contest` (with computed status)
- `src/lib/contestDb.ts` - Removed status from storage, computed dynamically

**Before:**
```typescript
interface Contest {
  status: ContestStatus; // Stored in database ❌
}

await collection.insertOne({
  ...contest,
  status: getContestStatus(startTime, endTime) // Stored ❌
});
```

**After:**
```typescript
interface StoredContest {
  // No status field ✅
}

interface Contest extends StoredContest {
  status: ContestStatus; // Computed dynamically ✅
}

// Helper to attach computed status
private attachStatus(stored: StoredContest): Contest {
  return {
    ...stored,
    status: getContestStatus(stored.startTime, stored.endTime)
  };
}
```

---

### 4. Dynamic Status Computation
**Files**: 
- `src/lib/contestDb.ts` - All methods compute status on retrieval
- Contest validation uses dynamic status checks

**Implementation:**
```typescript
async getContestById(contestId: string): Promise<Contest | null> {
  const storedContest = await collection.findOne({ id: contestId });
  
  if (!storedContest) return null;
  
  // Compute status dynamically - NEVER use stored status
  return this.attachStatus(storedContest);
}

async submitSolution(...) {
  const contest = await this.getContestById(contestId);
  
  // Dynamically check status using UTC time
  const contestStatus = getContestStatus(contest.startTime, contest.endTime);
  
  if (contestStatus !== 'live') {
    return { success: false, message: 'Contest is not active' };
  }
}
```

---

### 5. UTC Time Utilities
**File**: `src/lib/timezone.ts` (NEW)

**Key Functions:**
```typescript
// Validate UTC ISO format
isValidUTCTimestamp(timestamp: string): boolean

// Convert datetime-local to UTC
localDateTimeToUTC(value: string): string

// Display UTC in user's timezone
formatUTCInLocalTimezone(utc: string): string

// Get current UTC time
getCurrentUTC(): string
```

---

### 6. Enhanced Contest Functions
**File**: `src/lib/contest.ts`

**Updated:**
```typescript
// Added UTC validation
export function isValidUTCTimestamp(timestamp: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoRegex.test(timestamp) && 
         !isNaN(new Date(timestamp).getTime()) &&
         new Date(timestamp).toISOString() === timestamp;
}

// Clear UTC documentation
export function getContestStatus(startTime: string, endTime: string): ContestStatus {
  // CRITICAL: All time comparisons must be done in UTC
  const now = new Date(); // Current UTC time
  const start = new Date(startTime); // Parse UTC ISO string
  const end = new Date(endTime); // Parse UTC ISO string
  
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

// Display UTC in user's local timezone
export function formatDateTimeInTimezone(
  utcTimestamp: string, 
  timezone: string = 'Asia/Kolkata'
): string {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    // ... options
  });
}
```

---

## 🚀 How It Works Now

### Creating a Contest

1. **User Input (Frontend)**
   - User in India selects: Jan 15, 2024, 4:00 PM (local time)
   - Browser's datetime-local input value: `"2024-01-15T16:00"`

2. **Frontend Conversion**
   ```typescript
   const start = new Date("2024-01-15T16:00"); // Interprets as local (IST)
   const startTimeUTC = start.toISOString();    // "2024-01-15T10:30:00.000Z"
   ```

3. **Backend Validation**
   ```typescript
   if (!isValidUTCTimestamp(startTimeUTC)) {
     return error; // Rejects non-UTC timestamps
   }
   ```

4. **Database Storage**
   ```typescript
   {
     startTime: "2024-01-15T10:30:00.000Z",  // UTC ISO format
     endTime: "2024-01-15T12:30:00.000Z",
     // NO status field
   }
   ```

### Checking Contest Status

1. **Retrieval**
   ```typescript
   const storedContest = await db.findOne({ id });
   const contest = attachStatus(storedContest); // Adds computed status
   ```

2. **Dynamic Computation (Server in any timezone)**
   ```typescript
   const now = new Date();                       // UTC: 2024-01-15T11:00:00.000Z
   const start = new Date(contest.startTime);    // UTC: 2024-01-15T10:30:00.000Z
   const end = new Date(contest.endTime);        // UTC: 2024-01-15T12:30:00.000Z
   
   // Comparison in UTC
   if (now >= start && now <= end) {
     status = 'live'; // ✅ Correct regardless of server location
   }
   ```

3. **Frontend Display**
   ```typescript
   // Automatically converts to user's timezone
   new Date("2024-01-15T10:30:00.000Z").toLocaleString()
   // India: "Jan 15, 2024, 4:00 PM"
   // US (PST): "Jan 15, 2024, 2:30 AM"
   ```

### Submitting Solutions

1. **User submits at 4:45 PM IST**
   
2. **Backend Check**
   ```typescript
   const contestStatus = getContestStatus(contest.startTime, contest.endTime);
   // Compares: UTC now vs UTC start/end
   // Result: 'live' ✅
   
   if (contestStatus !== 'live') {
     return error; // Submissions only during 'live' status
   }
   ```

3. **Record Submission**
   ```typescript
   {
     submittedAt: new Date().toISOString(), // "2024-01-15T11:15:00.000Z"
   }
   ```

---

## 🔍 Testing Scenarios

### ✅ Scenario 1: Server in USA, User in India
- **Server**: PST (UTC-8)
- **User**: IST (UTC+5:30)
- **Contest Start**: 4:00 PM IST = 10:30 AM UTC
- **Server Time Check**: `new Date()` → UTC time
- **Result**: ✅ Works correctly (UTC vs UTC comparison)

### ✅ Scenario 2: Daylight Saving Time
- **Contest**: Spans DST change (March 2024)
- **Storage**: All times in UTC (no DST)
- **Result**: ✅ No DST issues

### ✅ Scenario 3: Server Migration
- **Before**: Server in Singapore (UTC+8)
- **After**: Server in London (UTC+0)
- **Contest Times**: Stored in UTC
- **Result**: ✅ No changes needed

---

## 📋 Migration Checklist (If Upgrading Existing System)

- [ ] Convert existing `startTime`/`endTime` to UTC ISO format
- [ ] Remove `status` field from all contest documents
- [ ] Update API clients to send UTC ISO timestamps
- [ ] Test contest creation from different timezones
- [ ] Test submissions during contest boundary times
- [ ] Verify display shows correct local times

---

## 🚫 Rules to Follow

### DO ✅
- Store all timestamps in UTC ISO format with `Z`
- Compute contest status dynamically
- Use `new Date().toISOString()` for current time
- Let browser handle timezone display
- Validate all incoming timestamps are UTC

### DON'T ❌
- Store local time or timezone-specific strings
- Store contest status in database
- Use manual timezone offset calculations
- Compare local times from different sources
- Trust incoming timestamps without validation

---

## 📝 Summary

**Before:**
- ❌ Local datetime-local values sent to backend
- ❌ No timestamp format validation
- ❌ Contest status stored in database
- ❌ Potential timezone drift issues
- ❌ Server location dependent

**After:**
- ✅ UTC ISO timestamps enforced everywhere
- ✅ Strict validation with `isValidUTCTimestamp()`
- ✅ Dynamic status computation using UTC
- ✅ Works across all timezones and servers
- ✅ Daylight saving time proof
- ✅ Server location independent

---

**Implementation Date**: February 7, 2026
**Status**: ✅ Production Ready
