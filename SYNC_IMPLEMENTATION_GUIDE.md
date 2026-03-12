# Corporate-to-Bank Officer Sync Implementation Guide

## Current Architecture

### Backend (Already Implemented ✅)
- **Applications Table** has `bank` field to store which bank the application was submitted to
- **`/get_applications` endpoint** already filters by bank: `GET /get_applications?bank=HDFC%20Bank`
- **`/save_application` endpoint** stores bank information from corporate form

### Frontend (Partially Implemented)
- Corporate users select target bank in form
- Bank officers see pending requests IF they have correct bankName in localStorage

---

## Current Flow (What's Working)

```
Corporate User:
1. Fills application form
2. Selects "Target Bank" (e.g., "HDFC Bank")
3. Clicks "SUBMIT TO AI ENGINE"
4. Application saved with: bank: "HDFC Bank"
             ↓
  Backend stores in DB with bank name

Bank Officer:
1. Logs in with bank credentials
2. bankName stored in localStorage (e.g., "Demo Bank")
3. Clicks "Pending Requests" tab
4. Frontend calls: GET /get_applications?bank=Demo%20Bank
             ↓
  Backend returns ONLY applications for "Demo Bank"
```

---

## Issues to Fix

### Issue 1: Bank Name Mismatch
When corporate selects "HDFC Bank" in dropdown, but bank officer may have different name in system.

**Solution**: Standardize bank names. Use dropdown with fixed values:

### Issue 2: Real-Time Sync
Applications don't appear automatically; requires page refresh.

**Solution**: Add auto-refresh polling (every 5 seconds) or use WebSockets.

### Issue 3: Bank Officer Registration
Bank officers need to properly register with their bank name.

**Solution**: Improve signup/login flow to ensure bankName matches applications.

---

## Step-by-Step Implementation

### STEP 1: Standardize Bank Names

**File**: `react_frontend/app.jsx`

Replace all bank dropdown selections with consistent values:

```javascript
// Use these standard bank names EVERYWHERE:
const BANK_LIST = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank'
];

// In corporate form dropdowns - use BANK_LIST
// In bank officer signup - use BANK_LIST
// Pass to backend - use exact same values
```

**Current code in app.jsx (line ~1050):**
```javascript
<select required className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={borrowerForm.targetBank} onChange={e => setBorrowerForm({ ...borrowerForm, targetBank: e.target.value })}>
    <option value="">Select Financial Institution</option>
    <option>HDFC Bank</option>
    <option>ICICI Bank</option>
    <option>State Bank of India</option>
    <option>Axis Bank</option>
    <option>Kotak Mahindra Bank</option>
</select>
```

### STEP 2: Add Auto-Refresh to Pending Requests

**File**: `react_frontend/app.jsx`

Add polling to `renderPendingRequests()`:

```javascript
useEffect(() => {
    if (userRole === 'bank' && activeTab === 'Pending Requests') {
        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchApplications();
        }, 5000);
        return () => clearInterval(interval);
    }
}, [userRole, activeTab]);
```

### STEP 3: Improve Bank Officer Login/Signup

**File**: `react_frontend/app.jsx`

In signup for bank role, capture exact bank name:

```javascript
<select required className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700">
    <option value="">Select Your Bank</option>
    <option>HDFC Bank</option>
    <option>ICICI Bank</option>
    <option>State Bank of India</option>
    <option>Axis Bank</option>
    <option>Kotak Mahindra Bank</option>
</select>
```

### STEP 4: Backend - Add Bank Validation

**File**: `backend/main.py`

Update `/save_application` to validate bank name:

```python
VALID_BANKS = [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank'
]

@app.post("/save_application")
async def save_application(app_data: dict):
    # Validate bank name
    bank = app_data.get('bank', 'State Bank of India')
    if bank not in VALID_BANKS:
        bank = 'State Bank of India'  # Default fallback
    
    # ... rest of save logic
    cursor.execute('''
        INSERT INTO applications 
        (companyName, industry, amount, status, date, cin, pan, gstin, promoterNames, purpose, notes, address, bank)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (..., bank))
```

### STEP 5: Add Real-Time Notification Badge

**File**: `react_frontend/app.jsx`

Show badge when new applications arrive:

```javascript
// In renderPendingRequests, show count in sidebar:
{activeTab === "Pending Requests" && pendingApplications.length > 0 && 
    <span className={'ml-auto bg-amber-500 text-xs text-white px-2 py-0.5 rounded-full font-bold animate-pulse'}>
        {pendingApplications.length} NEW
    </span>
}
```

### STEP 6: Backend - Add Timestamp Tracking

**File**: `backend/main.py`

Update applications table to track when applications arrive:

```python
cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        ...
        created_at TEXT,  -- NEW: ISO timestamp of submission
        updated_at TEXT   -- NEW: Last modification
    )
''')

# In save_application, add:
import datetime
now = datetime.datetime.utcnow().isoformat()
cursor.execute('''
    INSERT INTO applications 
    (..., created_at, updated_at)
    VALUES (..., ?, ?)
''', (..., now, now))
```

---

## Testing Checklist

### Test 1: Corporate User → Bank Officer Sync
- [ ] Corporate user logs in
- [ ] Selects "HDFC Bank" as target
- [ ] Submits application
- [ ] Bank officer (HDFC Bank) logs in
- [ ] Opens "Pending Requests"
- [ ] New application appears within 5 seconds

### Test 2: Bank Filtering
- [ ] Verify bank officer only sees OWN bank's applications
- [ ] Different bank officer shouldn't see HDFC applications

### Test 3: Multiple Applications
- [ ] Corporate user submits multiple applications to same bank
- [ ] All appear in pending requests

### Test 4: Different Banks
- [ ] Corporate submits to HDFC, ICICI, Axis simultaneously
- [ ] Each bank officer sees only their applications

---

## Database Query for Debugging

Run this to see what's stored:

```sql
SELECT companyName, bank, status, amount, date FROM applications ORDER BY date DESC;
```

---

## Code Locations to Modify

| Component | File | Line(s) | Change |
|-----------|------|---------|--------|
| Corporate form bank dropdown | app.jsx | ~1050 | Use BANK_LIST |
| Fetch applications for bank | app.jsx | ~520 | Add polling |
| Bank signup form | app.jsx | ~200 | Add bank selection |
| Application save | main.py | ~135 | Validate bank names |
| Pending requests list | app.jsx | ~1270 | Show new badge |
| Get applications endpoint | main.py | ~176 | Already working ✅ |

---

## Quick Implementation Priority

**MUST DO (Required for sync):**
1. ✅ Standardize bank names
2. ✅ Verify /get_applications endpoint works with bank parameter
3. ✅ Test corporate form saves correct bank name

**SHOULD DO (Better UX):**
4. Add auto-refresh polling
5. Add notification badge
6. Improve bank officer signup

**NICE TO HAVE:**
7. Add WebSocket for real-time updates
8. Add timestamp filtering

---

## Common Issues & Fixes

### Issue: Bank officer sees no applications
**Check:**
- Ensure `localStorage.getItem('bankName')` matches bank in database
- Run: `SELECT DISTINCT bank FROM applications;` to see what banks exist

### Issue: Corporate form doesn't save bank
**Check:**
- Verify `borrowerForm.targetBank` has a value
- Check network tab: is bank being sent to `/save_application`?

### Issue: Applications disappear after refresh
**Check:**
- Verify SQLite database file exists: `intellicredit.db`
- Check file permissions on database file
