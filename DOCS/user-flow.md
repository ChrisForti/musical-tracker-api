## User flow schema

### Elements

1. User Actions:
   Add/Edit Performance (No approval required; tied to user)
   Add/Edit Casting (No approval required; tied to user)
2. Admin Actions:
   Approve CRUD for Musicals
   Approve CRUD for Productions
   Approve CRUD for Theaters
   Approve CRUD for Actors
   Approve CRUD for Roles
3. Approval Process:
   Request: Add Role (If not in DB, requires admin approval)
   Request: Add Actor (If not in DB, requires admin approval)
   Request: Add Theater (If not in DB, requires admin approval)

### Flow

1. User:
2. Performance
   Direct Action → “Add/Edit Performance” → Personal Database
3. Casting
   Direct Action → “Add/Edit Casting” → Personal Database
4. Admin Approval Needed:
5. Role (If not in DB)
   User Request → “Add Role” → Admin Approval → Central DB
6. Actor (If not in DB)
   User Request → “Add Actor” → Admin Approval → Central DB
7. Theater (If not in DB)
   User Request → “Add Theater” → Admin Approval → Central DB
8. Central Database Actions (Admin Only):
   CRUD for Musicals, Productions, Theaters, Roles/Actors

### Admin approval required

- Musical
  - User Request → “Add/Edit Musical” → Admin Approval → Central Database
- Role/Actor (if not in DB)
  - User Request → “Add Role/Actor” → Admin Approval → Central Database
- Theater (if not in DB)
  - User Request → “Add Theater” → Admin Approval → Central Database

### shortened list

- Users: Store user information.
- Performances: Store user-specific performances.
- Castings: Store user-specific castings.
- Musicals: Admin-approved musicals.
- Productions: Admin-approved productions.
- Theaters: Admin-approved theaters.
- Actors: Admin-approved actors.
- Roles: Admin-approved roles.
- ApprovalRequests: Track user requests for roles/actors and theaters.
