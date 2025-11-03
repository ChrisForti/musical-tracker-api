import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { MainDashboard } from "../pages/MainDashboard";
import { NavigationProvider } from "../layout/NavigationProvider";
import { ToastProvider } from "../common/ToastProvider";
import { useAuth } from "../../hooks/useAuth";

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

describe("Navigation and Authentication Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
  });

  describe("Navigation Between Sections", () => {
    describe("Admin Navigation", () => {
      it("should display admin sections for admin users", async () => {
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

        await waitFor(() => {
          // Should show navigation elements for admin
          expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        });
      });
    });

    describe("Public User Navigation", () => {
      it("should allow access to public sections", async () => {
        mockUseAuth.mockReturnValue({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          isLoading: false,
          logout: vi.fn(),
          refreshAuth: vi.fn(),
        });

        renderWithProviders(<MainDashboard />);

        // Should see public access elements
        await waitFor(() => {
          expect(screen.getByText(/browse/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Admin Role Restrictions", () => {
    it("should allow admin users to access all features", async () => {
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

      await waitFor(() => {
        // Admin should see dashboard
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it("should restrict features for regular users", async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "123",
          email: "user@test.com",
          firstName: "User",
          lastName: "Test",
          isAdmin: false,
        },
        isLoggedIn: true,
        isAdmin: false,
        isLoading: false,
        logout: vi.fn(),
        refreshAuth: vi.fn(),
      });

      renderWithProviders(<MainDashboard />);

      // Should not show admin-only content
      const adminElements = screen.queryByText(/admin panel/i);
      expect(adminElements).not.toBeInTheDocument();
    });
  });
});
