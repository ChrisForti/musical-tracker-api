# Frontend Testing Checklist

## 🔐 Admin Security & Authentication Testing

### Admin Dashboard Access
- [ ] **Admin User Login**
  - Navigate to login page
  - Login with admin credentials (admin@test.com / admin123)
  - Verify admin dashboard is displayed on homepage
  - Check that statistics cards are visible and functional

- [ ] **Non-Admin User Restrictions**
  - Login with regular user or browse without login
  - Verify admin dashboard is NOT visible on homepage
  - Check that admin menu items are hidden in sidebar
  - Try to access `/admin/*` routes directly - should show "Access Denied"

### Sidebar Security
- [ ] **Admin Sidebar Features**
  - Login as admin - verify "Admin Dashboard" link is visible
  - Check "Management" submenu appears with "Pending Approvals" link
  - Verify user info shows admin status

- [ ] **Non-Admin Sidebar**
  - Browse as regular user - verify admin links are completely hidden
  - Confirm no "Admin Dashboard" or "Management" menu items visible

## 📋 Form Validation & Enhancement Testing

### Form Validation System
- [ ] **Actor Form Validation**
  - Navigate to "Add Actor" (`/actors/new`)
  - Leave name field empty and submit - should show validation error
  - Enter 1 character name - should show "minimum 2 characters" error
  - Enter valid data - should submit successfully with toast notification

- [ ] **Musical Form Validation**
  - Go to "Add Musical" (`/musicals/new`)
  - Test required fields (title, composer, lyricist, genre)
  - Test field length limits (synopsis max 2000 characters)
  - Verify real-time validation on blur

- [ ] **Theater & Performance Forms**
  - Test theater form required fields (name, city)
  - Test performance form date validation (no past dates allowed)
  - Test time format validation (HH:MM format)

### Rich Text Editor
- [ ] **Rich Text Features**
  - Find forms with description/bio fields
  - Test formatting toolbar (Bold, Italic, Underline, Lists)
  - Verify character count displays correctly
  - Test placeholder text appears when empty

### Auto-Save Draft Functionality
- [ ] **Draft Persistence**
  - Start filling out a form (actor, musical, etc.)
  - Navigate away from the page
  - Return to the form - data should be restored
  - Complete and submit form - draft should be cleared

### Loading States & Toast Notifications
- [ ] **Form Submission States**
  - Submit any form - verify loading spinner appears
  - Check buttons are disabled during submission
  - Verify success toast appears on successful submission
  - Test error toast on failed submission (disconnect network if needed)

## 🌐 Public-Facing Features Testing

### Public Musical Directory
- [ ] **Browse Musicals**
  - Navigate to `/public/musicals`
  - Verify musicals are displayed without requiring login
  - Test search functionality (title, composer, lyricist)
  - Test genre filter dropdown

- [ ] **Musical Detail Pages**
  - Click on any musical card to view details
  - Navigate to `/public/musical/[id]` directly
  - Verify upcoming performances are shown
  - Check past performances section
  - Test "Back to Musical Directory" link

### Performance Calendar
- [ ] **Calendar View**
  - Navigate to `/public/calendar`
  - Verify calendar displays current month
  - Test navigation between months (prev/next buttons)
  - Click on days with performances - should show details
  - Check responsive design on mobile

## 🎨 User Interface & Experience Testing

### Navigation & Back Buttons
- [ ] **Admin Navigation**
  - Login as admin and visit individual pages (actors, musicals, theaters)
  - Verify "Back to Dashboard" buttons appear on these pages
  - Test navigation back to admin dashboard

- [ ] **Public Navigation**
  - Browse public pages without admin access
  - Verify no admin-specific navigation elements appear
  - Test public page navigation flows

### Header Padding & Layout
- [ ] **Layout Issues**
  - Visit all main pages (HomePage, ActorPage, MusicalPage, etc.)
  - Verify content is not cut off under the header
  - Check padding is consistent across pages

### Toast Notification System
- [ ] **CRUD Operation Notifications**
  - Create, edit, and delete actors/musicals/theaters
  - Verify appropriate success/error toasts appear
  - Test bulk operations in admin pending approvals
  - Check toast positioning and styling

## 📊 Admin Dashboard Features Testing

### Statistics Display
- [ ] **Dashboard Stats**
  - Login as admin and view dashboard
  - Verify all stat cards show correct numbers
  - Click on stat cards - should navigate to respective pages
  - Test "Quick Actions" buttons functionality

### Pending Approvals System
- [ ] **Approval Workflow**
  - Navigate to pending approvals page (`/admin/pending`)
  - Test filtering options (All, Actors, Musicals, etc.)
  - Select multiple items and test bulk approve/reject
  - Verify status badges update correctly
  - Test individual approve/reject buttons

## 🔍 Search & Filter Testing

### Global Search
- [ ] **Sidebar Search**
  - Use search box in sidebar
  - Search for actors, musicals, performances
  - Verify results filter correctly across pages
  - Test search persistence when navigating

### Page-Specific Filters
- [ ] **Advanced Filtering**
  - Test approval status filters on various pages
  - Check composer/genre filters on musical pages
  - Verify filter combinations work correctly

## 📱 Responsive Design Testing

### Mobile & Desktop
- [ ] **Responsive Layout**
  - Test all pages on mobile screen sizes
  - Verify sidebar collapses appropriately
  - Check form layouts adapt to smaller screens
  - Test calendar responsive behavior

### Dark/Light Theme
- [ ] **Theme Toggle**
  - Test theme switcher in sidebar
  - Verify theme persists across page reloads
  - Check all components display properly in both themes

## 🚫 Error Handling Testing

### Authentication Errors
- [ ] **Login Issues**
  - Test invalid credentials
  - Test network connection issues during login
  - Verify appropriate error messages display

### API Error Handling
- [ ] **Network Issues**
  - Disable network and test form submissions
  - Test API timeout scenarios
  - Verify graceful error handling with user-friendly messages

## 🎯 End-to-End User Flows

### Admin Workflow
- [ ] **Complete Admin Session**
  1. Login as admin
  2. View dashboard statistics
  3. Navigate to pending approvals
  4. Approve/reject items
  5. Create new musical with validation
  6. Test draft auto-save
  7. Use rich text editor for descriptions
  8. Navigate using back buttons

### Public User Workflow
- [ ] **Public User Experience**
  1. Browse musical directory without login
  2. Search and filter musicals
  3. View musical details
  4. Check performance calendar
  5. Navigate between public pages
  6. Verify no admin features accessible

---

## 📝 Testing Notes

### Test Environment Setup
1. **Start Backend**: Run `npm run dev` in root directory
2. **Start Frontend**: Run `npm run dev` in client directory
3. **Database**: Ensure PostgreSQL is running
4. **Admin User**: Use admin@test.com / admin123 for admin testing

### Browser Testing
- Test in Chrome, Firefox, Safari
- Test responsive design at various screen sizes
- Check developer console for any JavaScript errors

### Performance Checks
- Verify page load times are reasonable
- Check for any memory leaks with form auto-save
- Ensure smooth navigation between pages

---

**✅ All tests passing means the frontend implementation is complete and secure!**