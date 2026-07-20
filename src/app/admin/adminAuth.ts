"use client";

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-zebra-890.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

// Whitelisted admin emails authorized for system management
export const ALLOWED_ADMIN_EMAILS = [
  "alexsouthflow@gmail.com",
  "alexsouthflow2@gmail.com",
];

const ADMIN_STORAGE_KEY = 'admin_auth_state';
const ADMIN_TOKEN_KEY = 'admin_id_token';

/**
 * Check if an email address is an authorized admin email
 */
export function isAllowedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_ADMIN_EMAILS.includes(normalized);
}

/**
 * Configure admin authentication (no-op stub for compatibility with existing code)
 */
export function configureAdminAuth() {
  console.log("✅ Convex admin authentication initialized");
}

/**
 * Store admin authentication state in localStorage
 */
export function setAdminAuthState(adminData: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
    localStorage.setItem('isAdminAuthenticated', 'true');
    console.log("✅ Admin auth state stored");
  } catch (error) {
    console.error("❌ Failed to store admin auth state:", error);
  }
}

/**
 * Get stored admin authentication state from localStorage
 */
export function getAdminAuthState() {
  if (typeof window === 'undefined') return null;
  try {
    const adminDataString = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!adminDataString) return null;
    const data = JSON.parse(adminDataString);
    if (data && (isAllowedAdminEmail(data.email) || data.role === 'admin')) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to retrieve admin auth state:", error);
    return null;
  }
}

/**
 * Clear admin authentication state
 */
export function clearAdminAuthState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('isAdminAuthenticated');
    console.log("✅ Admin auth state cleared");
  } catch (error) {
    console.error("❌ Failed to clear admin auth state:", error);
  }
}

/**
 * Login as admin using Convex authentication
 * Enforces admin email access for alexsouthflow@gmail.com and alexsouthflow2@gmail.com
 */
export async function loginAsAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate allowed admin email
  if (!isAllowedAdminEmail(normalizedEmail)) {
    return {
      success: false,
      message: `Access denied. Email '${normalizedEmail}' is not an authorized administrator. Authorized emails are: ${ALLOWED_ADMIN_EMAILS.join(", ")}`,
      data: null,
    };
  }

  try {
    let result: any = null;

    // Try signing in via Convex Auth
    try {
      result = await convex.mutation("auth:signIn" as any, {
        email: normalizedEmail,
        password,
      });
    } catch (signInErr: any) {
      console.warn("Convex auth:signIn attempt failed:", signInErr?.message);

      // If user does not exist in Convex authUsers table yet, auto-seed/create the admin account
      if (signInErr?.message?.includes("Invalid email") || signInErr?.message?.includes("not found")) {
        try {
          await convex.mutation("auth:signUp" as any, {
            email: normalizedEmail,
            password,
            name: normalizedEmail.split("@")[0].replace(/\./g, " ").toUpperCase(),
            role: "admin",
          });

          // Retry sign in after auto-registering
          result = await convex.mutation("auth:signIn" as any, {
            email: normalizedEmail,
            password,
          });
        } catch (signUpErr: any) {
          throw new Error("Failed to initialize admin account in database: " + (signUpErr.message || "Unknown error"));
        }
      } else {
        throw signInErr;
      }
    }

    if (!result || !result.token) {
      return {
        success: false,
        message: "Invalid email or password",
        data: null,
      };
    }

    const displayName = normalizedEmail.split("@")[0]
      .replace(/\./g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const adminDetails = {
      id: result.user?.id || 1,
      cognitoId: String(result.user?.id || normalizedEmail),
      name: displayName,
      email: normalizedEmail,
      role: "admin",
      token: result.token,
      tokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    // Store state in localStorage
    setAdminAuthState(adminDetails);
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    }

    // Set HttpOnly cookie for middleware protection
    try {
      await fetch('/api/admin/set-auth-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.token }),
      });
    } catch (e) {
      console.warn("Could not set admin auth cookie:", e);
    }

    return {
      success: true,
      message: "Admin login successful",
      data: adminDetails,
    };
  } catch (error: any) {
    console.error("❌ Admin login error:", error);
    return {
      success: false,
      message: error.message || "Login failed. Please check your password.",
      data: null,
    };
  }
}

/**
 * Register a new admin account (restricted to authorized admin emails)
 */
export async function registerAdmin(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isAllowedAdminEmail(normalizedEmail)) {
    return {
      success: false,
      message: `Access denied. '${normalizedEmail}' is not in the authorized admin list (${ALLOWED_ADMIN_EMAILS.join(", ")})`,
    };
  }

  try {
    await convex.mutation("auth:signUp" as any, {
      email: normalizedEmail,
      password,
      name,
      role: "admin",
    });

    // Automatically sign in after registration
    return await loginAsAdmin(normalizedEmail, password);
  } catch (error: any) {
    if (error.message?.includes("already registered")) {
      // If already registered, attempt login
      return await loginAsAdmin(normalizedEmail, password);
    }
    return {
      success: false,
      message: error.message || "Registration failed",
    };
  }
}

/**
 * Logout admin user
 */
export async function logoutAdmin() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    if (token) {
      try {
        await convex.mutation("auth:signOut" as any, { token });
      } catch (e) {
        // Ignore remote signout errors
      }
    }

    clearAdminAuthState();

    // Clear admin auth cookie
    try {
      await fetch('/api/admin/remove-auth-cookie', { method: 'POST' });
    } catch (e) {
      // Ignore cookie clearing errors
    }

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: any) {
    clearAdminAuthState();
    return {
      success: false,
      message: error.message || "Logout failed",
    };
  }
}

/**
 * Check if current user is authenticated as admin
 */
export async function checkAdminAuth() {
  try {
    const adminData = getAdminAuthState();
    if (adminData && (isAllowedAdminEmail(adminData.email) || adminData.role === 'admin')) {
      return { isAuthenticated: true, adminData };
    }
    clearAdminAuthState();
    return { isAuthenticated: false, adminData: null };
  } catch (error) {
    clearAdminAuthState();
    return { isAuthenticated: false, adminData: null };
  }
}
