### Admin Dashboard Requirements

---

#### **Overview**

The admin dashboard is designed to manage and approve user requests related to musicals, productions, theaters, actors, roles, and performances. It provides functionality for both user actions and admin actions, with an approval process for certain requests.

---

### **Elements**

#### **1. User Actions**

Users can perform the following actions without requiring admin approval:

- **Add/Edit Performance:** Users can add or edit performances tied to their account.
- **Add/Edit Casting:** Users can add or edit casting details tied to their account.

---

#### **2. Admin Actions**

Admins have the ability to approve or manage CRUD (Create, Read, Update, Delete) operations for the following entities:

- **Musicals:** Approve or manage musicals in the central database.
- **Productions:** Approve or manage productions in the central database.
- **Theaters:** Approve or manage theaters in the central database.
- **Actors:** Approve or manage actors in the central database.
- **Roles:** Approve or manage roles in the central database.

---

#### **3. Approval Process**

Certain user requests require admin approval before being added to the central database:

- **Request: Add Role**
  - If the role does not exist in the database, the user request requires admin approval.
- **Request: Add Actor**
  - If the actor does not exist in the database, the user request requires admin approval.
- **Request: Add Theater**
  - If the theater does not exist in the database, the user request requires admin approval.

---

### **Admin Approval Workflow**

#### **Musical**

- **Workflow:**
  - User Request → “Add/Edit Musical” → Admin Approval → Central Database

#### **Role (if not in DB)**

- **Workflow:**
  - User Request → “Add Role” → Admin Approval → Central Database

#### **Actor (if not in DB)**

- **Workflow:**
  - User Request → “Add Actor” → Admin Approval → Central Database

#### **Theater (if not in DB)**

- **Workflow:**
  - User Request → “Add Theater” → Admin Approval → Central Database

---

### **Features Breakdown**

#### **User Dashboard**

- **Performance Management:**
  - Add/Edit performances tied to the user.
- **Casting Management:**
  - Add/Edit casting details tied to the user.

#### **Admin Dashboard**

- **Approval Queue:**
  - View pending requests for musicals, roles, actors, and theaters.
- **CRUD Management:**
  - Manage musicals, productions, theaters, actors, and roles in the central database.
- **Approval Actions:**
  - Approve or reject user requests for roles, actors, and theaters.

---

### **Technical Requirements**

#### **Frontend**

- **Admin Dashboard UI:**
  - A clean and intuitive interface for managing approvals and CRUD operations.
- **User Dashboard UI:**
  - A simplified interface for adding/editing performances and casting.

#### **Backend**

- **Approval System:**
  - Implement an approval queue for admin actions.
- **Database Management:**
  - Centralized database for musicals, productions, theaters, actors, and roles.
- **Role-Based Access Control:**
  - Separate permissions for users and admins.

---

### **Summary**

The admin dashboard is a critical tool for managing and approving user requests related to musicals, productions, theaters, actors, and roles. It ensures data integrity in the central database while providing users with the ability to manage performances and casting independently.
