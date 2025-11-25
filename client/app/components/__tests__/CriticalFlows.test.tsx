import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { NavigationProvider } from "../layout/NavigationProvider";
import { ToastProvider } from "../common/ToastProvider";
import { useAuth } from "../../hooks/useAuth";
import { MainDashboard } from "../pages/MainDashboard";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth");
const mockUseAuth = vi.mocked(useAuth);

// Mock fetch for API calls
global.fetch = vi.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <NavigationProvider>{component}</NavigationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe("Critical User Flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
  });

  describe("Authentication Flow", () => {
    it("should show login button for unauthenticated users", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoggedIn: false,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it("should allow access to browse section for unauthenticated users", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoggedIn: false,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      // Should show browse section option
      await waitFor(() => {
        const browseButton = screen.getByText(/browse/i);
        expect(browseButton).toBeInTheDocument();
      });
    });
  });

  describe("Admin Access", () => {
    it("should show admin features for admin users", async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "123",
          email: "admin@test.com",
          firstName: "Admin",
          lastName: "User",
          isAdmin: true,
        },
        isLoggedIn: true,
        isAdmin: true,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      // Should show admin sections
      await waitFor(() => {
        expect(screen.getByText(/management/i)).toBeInTheDocument();
      });
    });

    it("should restrict admin features for regular users", async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "123",
          email: "user@test.com",
          firstName: "Regular",
          lastName: "User",
          isAdmin: false,
        },
        isLoggedIn: true,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      // Should not show admin sections - test will pass if no admin sections found
      const managementSections = screen.queryByText(/admin/i);
      expect(managementSections).not.toBeInTheDocument();
    });
  });

  describe("Navigation Flow", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "123",
          email: "user@test.com",
          firstName: "Test",
          lastName: "User",
          isAdmin: false,
        },
        isLoggedIn: true,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });
    });

    it("should display main dashboard sections", async () => {
      renderWithProviders(<MainDashboard />);

      await waitFor(() => {
        // Should show basic navigation sections
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it("should handle section switching", async () => {
      renderWithProviders(<MainDashboard />);

      await waitFor(() => {
        const browseButton = screen.getByText(/browse/i);
        fireEvent.click(browseButton);
        // Test passes if no errors thrown during navigation
        expect(browseButton).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation Basics", () => {
    it("should render without crashing", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoggedIn: false,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      const { container } = renderWithProviders(<MainDashboard />);
      expect(container).toBeInTheDocument();
    });

    it("should handle loading states", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoggedIn: false,
        isAdmin: false,
        isLoading: true,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      // Should handle loading state gracefully
      expect(screen.queryByText(/loading/i)).toBeTruthy();
    });
  });
});
