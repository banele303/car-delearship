"use client";

import { Amplify } from "aws-amplify";
import { type ResourcesConfig } from "aws-amplify";
import { fetchAuthSession as awsFetchAuthSession, getCurrentUser, signIn, signOut } from "aws-amplify/auth";

// Re-export fetchAuthSession for use in other files
export { awsFetchAuthSession as fetchAuthSession };

// Admin authentication constants
const ADMIN_STORAGE_KEY = 'admin_auth_state';
const ADMIN_TOKEN_KEY = 'admin_id_token';
let isAdminAuthConfigured = false;

/**
 * Configure Amplify for admin authentication
 * This uses the same Cognito pool but isolates the authentication flow
 */
export function configureAdminAuth() {
  if (isAdminAuthConfigured) return;
  
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
        loginWith: {
          email: true,
          username: true,
          phone: false,
        }
      },
      // Ensure consistent storage across admin section
      ssr: true
    }
  } as ResourcesConfig);
  
  isAdminAuthConfigured = true;
  console.log("✅ Admin authentication configured");
}

/**
 * Store admin authentication state
 */
export function setAdminAuthState(adminData: any) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
    console.log("✅ Admin auth state stored");
  } catch (error) {
    console.error("❌ Failed to store admin auth state:", error);
  }
}

/**
 * Get stored admin authentication state
 */
export function getAdminAuthState() {
  if (typeof window === 'undefined') return null;
  
  try {
    const adminDataString = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!adminDataString) return null;
    return JSON.parse(adminDataString);
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
    console.log("✅ Admin auth state cleared");
  } catch (error) {
    console.error("❌ Failed to clear admin auth state:", error);
  }
}

/**
 * Login as admin
 */
export async function loginAsAdmin(email: string, password: string) {
  try {
    configureAdminAuth();
    
    try {
      await signOut();
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    const signInResult = await signIn({
      username: email,
      password,
    });
    
    if (!signInResult.isSignedIn) {
      return {
        success: false,
        message: "Sign in failed",
        data: null
      };
    }
    
    const { isAuthenticated, adminData } = await checkAdminAuth();

    if (isAuthenticated && adminData) {
        return {
            success: true,
            message: "Admin login successful",
            data: adminData
        };
    } else {
        // If checkAdminAuth fails, it means the user is not a valid admin.
        await signOut(); // Sign out the non-admin user.
        return {
            success: false,
            message: "You don't have admin privileges",
            data: null
        };
    }

  } catch (error: any) {
    console.error("❌ Admin login error:", error);
    return {
      success: false,
      message: error.message || "Login failed",
      data: null
    };
  }
}

/**
 * Logout admin user
 */
export async function logoutAdmin() {
  try {
    await signOut();
    clearAdminAuthState();
    return {
      success: true,
      message: "Logged out successfully"
    };
  } catch (error) {
    console.error("❌ Admin logout error:", error);
    clearAdminAuthState(); // Also clear state on error
    return {
      success: false,
      message: error instanceof Error ? error.message : "Logout failed"
    };
  }
}

/**
 * Check if current user is authenticated as admin
 */
export async function checkAdminAuth() {
  try {
    // Always check the session from Cognito first
    const session = await awsFetchAuthSession();
    if (!session?.tokens?.idToken) {
      clearAdminAuthState();
      return { isAuthenticated: false, adminData: null };
    }

    // Check token expiration
    const expiration = session.tokens.idToken.payload.exp;
    const now = Math.floor(Date.now() / 1000);
    if (expiration && expiration < now) {
      console.log("❌ Admin token expired");
      clearAdminAuthState();
      return { isAuthenticated: false, adminData: null };
    }
    
    // Extract user information from token
    const userRole = session.tokens.idToken.payload?.['custom:role'] as string;
    const userEmail = session.tokens.idToken.payload?.email as string;
    
    // User is admin if they have the admin role or the specific admin email
    const isAdmin = userRole === 'admin' || 
                   (userEmail && userEmail.toLowerCase() === 'admin@student24.co.za');
    
    if (!isAdmin) {
      clearAdminAuthState();
      return { isAuthenticated: false, adminData: null };
    }
    
    // User is authenticated as admin, now get/create the user details
    const storedAdminData = getAdminAuthState();

    // If we have stored data and the cognitoId matches, we can use it.
    const user = await getCurrentUser();
    if (storedAdminData && storedAdminData.cognitoId === user.userId) {
        // Optionally update expiration time and return
        if (storedAdminData.tokenExpires !== expiration) {
            const updatedAdminData = { ...storedAdminData, tokenExpires: expiration };
            setAdminAuthState(updatedAdminData);
            return { isAuthenticated: true, adminData: updatedAdminData };
        }
        return { isAuthenticated: true, adminData: storedAdminData };
    }

    // If no stored data or mismatch, create it now
    let displayName = session.tokens.idToken.payload?.name as string;
    if (!displayName || displayName.startsWith('Admin_')) {
      if (userEmail) {
        displayName = userEmail.split('@')[0]
          .replace(/\./g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
      } else {
        displayName = 'Administrator';
      }
    }
    
    const adminDetails = {
      id: 0,
      cognitoId: user.userId,
      name: displayName,
      email: userEmail,
      role: 'admin',
      tokenExpires: expiration || 0
    };
    
    setAdminAuthState(adminDetails);
    return { isAuthenticated: true, adminData: adminDetails };

  } catch (error) {
    // This error is often thrown when there's no session, which is a valid state.
    console.log("Admin auth check: No active session or error.", error);
    clearAdminAuthState();
    return { isAuthenticated: false, adminData: null };
  }
}
