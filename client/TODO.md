# Frontend Development TODO

## ✅ Completed

- [x] LoginPage with real API integration
- [x] ActorPage/ActorForm with full CRUD operations
- [x] MusicalPage/MusicalForm/MusicalDetail with full CRUD operations
- [x] PerformancePage/PerformanceForm with full CRUD operations
- [x] CORS configuration for API communication
- [x] Authentication token storage and usage
- [x] Remove all mock data and connect to real database
- [x] Theater Management System - Complete CRUD operations with admin verification
- [x] User Registration - Modal-based registration system integrated with sidebar
- [x] Performance Form Theater Integration - Verified theaters only dropdown

## 🚧 High Priority - Core Functionality

### ✅ Theater Management (COMPLETED)

- [x] TheaterPage - List all theaters with real API data
- [x] TheaterForm - Create/edit theaters (name, city, address fields)
- [x] TheaterDetail - View individual theater information
- [x] Integration with performance creation (theater selection dropdown)
- [x] Admin verification system for theater approval
- [x] Navigation routing and sidebar integration

### ✅ Role Management (COMPLETED)

- [x] RolePage - List roles by musical with filtering
- [x] RoleForm - Create/edit character roles for musicals
- [x] Link roles to specific musicals via musicalId
- [x] Integration with casting system
- [x] Musical detail page role integration
- [x] Admin dashboard integration

### ✅ Casting Management (COMPLETED)

- [x] CastingPage - Manage actor-role assignments for performances
- [x] CastingForm - Assign actors to roles for specific performances
- [x] Complex form with dropdowns for: actor, role, performance
- [x] Display casting information on performance details
- [x] Admin dashboard integration
- [x] Performance detail page casting integration

### Media/Image Management

- [ ] Image upload component for musical/performance posters
- [ ] Integration with /v2/media endpoint
- [ ] Image display in musical/performance lists and details
- [ ] Image deletion and replacement functionality

## 🎨 User Interface Enhancements

### Navigation & Layout

- [ ] Main navigation menu/sidebar updates for new pages
- [ ] Breadcrumb navigation for nested pages
- [ ] Responsive design improvements for mobile
- [ ] Dark/light mode toggle functionality

### Data Display Improvements

- [ ] Pagination for large lists (actors, musicals, performances)
- [ ] Search and filtering capabilities
- [ ] Sorting options (by name, date, status, etc.)
- [ ] Data export functionality (CSV, JSON)

### Form Enhancements

- [ ] Form validation with error messages
- [ ] Loading states for form submissions
- [ ] Success/error notifications (toast messages)
- [ ] Auto-save draft functionality
- [ ] Rich text editor for descriptions/notes

## 👤 User Experience Features

### Dashboard/Home Page

- [ ] Admin dashboard with statistics (total musicals, actors, performances)
- [ ] Recent activity feed
- [ ] Quick actions (add musical, add actor, etc.)
- [ ] Pending items requiring approval

### User Management (Admin)

- [ ] UserPage - List all users
- [ ] UserForm - Edit user roles and permissions
- [ ] User approval workflow
- [ ] Admin privileges management

### Approval Workflow

- [ ] PendingPage - Items awaiting admin approval
- [ ] Bulk approval actions
- [ ] Approval status indicators throughout the app
- [ ] Notification system for pending items

## 🔧 Technical Improvements

### Performance & Optimization

- [ ] Implement React Query/SWR for data caching
- [ ] Lazy loading for large datasets
- [ ] Image optimization and lazy loading
- [ ] Bundle size optimization

### Error Handling

- [ ] Global error boundary
- [ ] API error handling with user-friendly messages
- [ ] Offline state handling
- [ ] Retry mechanisms for failed requests

### Testing

- [ ] Unit tests for components
- [ ] Integration tests for API calls
- [ ] End-to-end tests for critical user flows
- [ ] Accessibility testing

### Developer Experience

- [ ] TypeScript interface improvements
- [ ] Component documentation
- [ ] Storybook setup for component library
- [ ] ESLint and Prettier configuration

## 📱 Future Enhancements

### Public-Facing Features

- [ ] Public musical directory (non-admin users)
- [ ] Performance calendar view
- [ ] Actor/musical search for general users
- [ ] Public API documentation page

### Advanced Features

- [ ] Calendar integration for performance scheduling
- [ ] Email notifications for performance updates
- [ ] Print-friendly views for programs/casting sheets
- [ ] Data analytics and reporting dashboard
- [ ] Import/export from external theater management systems

### Mobile App Considerations

- [ ] PWA (Progressive Web App) setup
- [ ] Mobile-optimized layouts
- [ ] Offline functionality
- [ ] Push notifications

## 📋 Notes

- Prioritize theater and role management as they complete the core musical theater workflow
- Focus on user experience improvements after core functionality is complete
- Consider data relationships when building forms (musicals → roles → casting)
- Maintain consistent design patterns across all new pages
- Ensure all new pages follow the same authentication and error handling patterns established in completed pages
