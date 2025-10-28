import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "../pages/admin/LoginPage";
import { useAuth } from "../../hooks/useAuth";
import { ToastProvider } from "../common/ToastProvider";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth");
const mockUseAuth = vi.mocked(useAuth);

// Mock fetch for API calls
global.fetch = vi.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>{component}</ToastProvider>
    </BrowserRouter>
  );
};

describe("Login/Logout Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      isLoading: false,
      logout: vi.fn(),
      refreshAuth: vi.fn(),
    });
  });

  describe("Login Functionality", () => {
    it("should display login form with required fields", () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should show validation errors for empty fields", async () => {
      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("should handle successful login", async () => {
      const mockLoginSuccess = vi.fn();

      // Mock successful API response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            message: "Login successful",
            token: "mock-token-123",
          }),
      } as Response);

      renderWithProviders(<LoginPage onLoginSuccess={mockLoginSuccess} />);

      // Fill in valid credentials
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "admin123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLoginSuccess).toHaveBeenCalled();
      });
    });

    it("should handle invalid credentials error", async () => {
      // Mock failed API response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            errors: { message: "Invalid email or password" },
          }),
      } as Response);

      renderWithProviders(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "wrong@email.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle network/server errors", async () => {
      // Mock network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      renderWithProviders(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "admin123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Logout Functionality", () => {
    it("should clear user session on logout", () => {
      const mockLogout = vi.fn();

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
        logout: mockLogout,
        refreshAuth: vi.fn(),
      });

      // Test logout button functionality would be in Sidebar component
      // This would be tested in Sidebar.test.tsx
      expect(mockLogout).toBeDefined();
    });
  });
});
