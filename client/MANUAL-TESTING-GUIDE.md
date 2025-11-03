# Manual Testing Guide - Musical Theater Tracker

## Testing Environment Setup

### Prerequisites

1. API server running on `localhost:3000`
2. Client dev server running on `localhost:5173`
3. PostgreSQL database running via Docker
4. Test devices available (laptop, iPhone, Android)

### Test Users

- **Admin User**: `admin@test.com` / `password123`
- **Regular User**: `user@test.com` / `password123`

---

## 🖥️ Desktop/Laptop Testing

### Browser Compatibility

Test on all major browsers:

- ✅ Chrome (latest)
- ✅ Safari (macOS)
- ✅ Firefox (latest)
- ✅ Edge (Windows if available)

### Desktop Test Scenarios

#### 1. Landing Page Experience

- [ ] Load `localhost:5173` without login
- [ ] Verify "Sign In" button works
- [ ] Verify "Browse Public Content" button works
- [ ] Check responsive design at different window sizes
- [ ] Test dark mode toggle (if implemented)

#### 2. Authentication Flow

- [ ] Click "Sign In" → Login modal opens
- [ ] Try invalid credentials → Error message shows
- [ ] Login with admin credentials → Redirects to admin dashboard
- [ ] Logout → Returns to landing page
- [ ] Login with regular user → Shows user dashboard

#### 3. Admin Dashboard Navigation

- [ ] All admin sections load without errors
- [ ] Statistics show correct counts (even if 0)
- [ ] "Manage" buttons navigate to correct sections
- [ ] Back navigation works properly
- [ ] Sidebar navigation (if present) works

---

## 📱 Mobile Device Testing

### iPhone Testing

Access via iPhone Safari: `http://[YOUR_LOCAL_IP]:5173`

#### Touch Interactions

- [ ] Tap to login works
- [ ] Form inputs focus properly on mobile keyboard
- [ ] Navigation menus work with touch
- [ ] Scrolling is smooth
- [ ] Buttons are properly sized for touch

#### Mobile Layout

- [ ] Content fits screen without horizontal scroll
- [ ] Text is readable without zooming
- [ ] Navigation is accessible on small screens
- [ ] Forms are usable on mobile keyboards

### Android Testing

Access via Chrome on Android: `http://[YOUR_LOCAL_IP]:5173`

#### Android-Specific

- [ ] All iPhone tests also work on Android
- [ ] Chrome mobile navigation
- [ ] Different screen sizes/densities
- [ ] Android keyboard behavior

---

## 🎭 User Scenario Testing

### Scenario 1: "New Admin Adds First Musical"

#### Setup

1. Start with empty database (or clear existing data)
2. Login as admin user

#### Complete Flow Testing

1. **Admin Dashboard**
   - [ ] Login as admin → See admin dashboard
   - [ ] Verify all counters show 0
   - [ ] All "Manage" buttons accessible

2. **Add First Musical**
   - [ ] Navigate to Musicals management
   - [ ] Click "Add Musical" (or similar)
   - [ ] Fill out musical form:
     - Name: "Hamilton"
     - Description: "Revolutionary War musical"
     - Year: 2015
   - [ ] Submit form → Success message
   - [ ] Musical appears in list
   - [ ] Dashboard counter updates to 1

3. **Add Actors for Musical**
   - [ ] Navigate to Actors management
   - [ ] Add first actor:
     - Name: "Lin-Manuel Miranda"
     - Email: "lin@example.com"
   - [ ] Add second actor:
     - Name: "Phillipa Soo"
     - Email: "phillipa@example.com"
   - [ ] Both actors appear in actors list
   - [ ] Dashboard counter updates to 2

4. **Create Roles**
   - [ ] Navigate to Roles management
   - [ ] Create role for Hamilton:
     - Musical: Hamilton
     - Character: "Alexander Hamilton"
     - Type: "Lead"
   - [ ] Create role for Hamilton:
     - Musical: Hamilton
     - Character: "Eliza Hamilton"
     - Type: "Lead"
   - [ ] Roles appear in list

5. **Assign Casting**
   - [ ] Navigate to Castings management
   - [ ] Assign Lin-Manuel → Alexander Hamilton role
   - [ ] Assign Phillipa → Eliza Hamilton role
   - [ ] Casting assignments appear correctly

6. **Verify Public View**
   - [ ] Logout from admin
   - [ ] Browse public content as unauthenticated user
   - [ ] Verify Hamilton appears in public listings
   - [ ] Verify cast information shows correctly
   - [ ] Verify no admin-only information visible

### Scenario 2: "Regular User Browse Experience"

1. **Unauthenticated Browsing**
   - [ ] Visit site without login
   - [ ] Click "Browse Public Content"
   - [ ] See Hamilton musical from previous test
   - [ ] View musical details
   - [ ] See cast information
   - [ ] No admin functions visible

2. **Regular User Login**
   - [ ] Login as regular user
   - [ ] See user dashboard (not admin)
   - [ ] Browse musicals with user permissions
   - [ ] Verify no admin sections accessible

---

## 🚨 Error Recovery Testing

### API Unavailable Scenarios

#### 1. API Server Down

1. **Setup**: Stop the API server (`localhost:3000`)
2. **Test Client Behavior**:
   - [ ] Landing page still loads
   - [ ] Login attempts show appropriate error
   - [ ] No JavaScript crashes
   - [ ] User gets clear error message
   - [ ] App doesn't become unresponsive

#### 2. Database Connection Lost

1. **Setup**: Stop PostgreSQL container
2. **Test API Behavior**:
   - [ ] API returns appropriate 500 errors
   - [ ] Client shows database error messages
   - [ ] No API crashes
   - [ ] Graceful error handling

#### 3. Network Timeout Scenarios

1. **Setup**: Slow down network (browser dev tools)
2. **Test Loading States**:
   - [ ] Loading spinners appear
   - [ ] Requests eventually timeout gracefully
   - [ ] User can retry failed operations
   - [ ] No infinite loading states

### Invalid Data Scenarios

#### 1. Form Validation Under Stress

- [ ] Submit empty forms → Proper validation errors
- [ ] Submit forms with SQL injection attempts
- [ ] Submit forms with XSS attempts
- [ ] Submit forms with extremely long text
- [ ] Upload invalid image files (if applicable)

#### 2. Authentication Edge Cases

- [ ] Login with deleted user account
- [ ] Login with expired sessions
- [ ] Access admin routes as regular user
- [ ] Manipulate JWT tokens

#### 3. Data Integrity Testing

- [ ] Delete musical that has roles assigned
- [ ] Delete actor that has casting assignments
- [ ] Create duplicate names/emails
- [ ] Handle concurrent user modifications

---

## 🔍 Performance & UX Testing

### Load Time Testing

- [ ] Initial page load < 3 seconds
- [ ] Navigation between sections < 1 second
- [ ] Form submissions < 2 seconds
- [ ] Large lists load progressively

### UX Flow Testing

- [ ] New user can complete signup to first action < 5 minutes
- [ ] Admin can add complete musical production < 10 minutes
- [ ] Public user can find and view musical < 2 minutes
- [ ] Error messages are clear and actionable

---

## 📋 Testing Checklist Summary

### Before Each Test Session

- [ ] API server running (`npm run dev` in root)
- [ ] Client server running (`npm run dev` in client/)
- [ ] Database accessible (docker containers up)
- [ ] Clear browser cache if needed

### Critical Flows to Validate

- [ ] Authentication works on all devices
- [ ] Admin can manage all content types
- [ ] Public browsing works without authentication
- [ ] Error handling is graceful and informative
- [ ] Mobile experience is fully functional

### Success Criteria

- [ ] No JavaScript errors in any browser console
- [ ] All forms validate and submit properly
- [ ] Navigation works consistently across devices
- [ ] Error states provide clear next steps
- [ ] Performance is acceptable for 100 concurrent users

---

## 🐛 Issue Tracking

### Found Issues Template

```
**Issue**: [Brief description]
**Device/Browser**: [Where it was found]
**Steps to Reproduce**: [Detailed steps]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Severity**: [Critical/High/Medium/Low]
**Screenshot**: [If applicable]
```

### Common Issues to Watch For

- Touch targets too small on mobile
- Forms not submitting on mobile keyboards
- Navigation breaking on back button
- Errors not displaying clearly
- Loading states missing or infinite
- Authentication state confusion
- Admin/user permission leaks
