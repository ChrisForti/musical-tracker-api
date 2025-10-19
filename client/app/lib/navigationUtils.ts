import type { NavigateFunction } from "react-router-dom";

/**
 * Navigate back to the main dashboard
 * This handles navigation from React Router sub-routes back to the NavigationProvider-managed main app
 */
export function navigateBackToDashboard(navigate: NavigateFunction) {
  // Navigate to root route which contains the NavigationProvider-managed MainDashboard
  navigate("/");
  // The NavigationProvider will default to 'home' section
  // For admin users, they can use the sidebar to navigate to admin sections
}
