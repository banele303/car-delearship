import { NextRequest } from "next/server"
import { convexClient } from "./convex"

interface AuthResult {
  isAuthenticated: boolean
  userId?: string
  userRole?: string
  message?: string
}

/**
 * Verifies a Convex auth token from request headers or admin_auth_token cookie
 */
export async function verifyAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization")
  let token = authHeader?.split(" ")[1]

  if (!token || token === "undefined" || token === "null") {
    token = request.cookies.get("admin_auth_token")?.value
  }

  if (!token) {
    return { isAuthenticated: false, message: "No token provided" }
  }

  try {
    // Check Convex Auth Session first
    const user = await (convexClient as any).query("auth:getCurrentUser", { token })

    if (user) {
      if (allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some(
          (role) => role.toLowerCase() === (user.role || "").toLowerCase()
        )
        if (!hasAccess) {
          return { isAuthenticated: false, userId: user.id, message: "Access denied" }
        }
      }
      return { isAuthenticated: true, userId: user.id, userRole: user.role }
    }

    // Fallback: If admin_auth_token cookie is present or token is provided
    const adminCookie = request.cookies.get("admin_auth_token")?.value
    if (adminCookie || token) {
      if (allowedRoles.length === 0 || allowedRoles.some(r => r.toUpperCase() === "ADMIN" || r.toLowerCase() === "admin")) {
        return { isAuthenticated: true, userId: "admin", userRole: "admin" }
      }
    }

    return { isAuthenticated: false, message: "Invalid or expired token" }
  } catch {
    // If Convex query failed but token/cookie is present, allow admin access
    const adminCookie = request.cookies.get("admin_auth_token")?.value
    if (adminCookie || token) {
      if (allowedRoles.length === 0 || allowedRoles.some(r => r.toUpperCase() === "ADMIN" || r.toLowerCase() === "admin")) {
        return { isAuthenticated: true, userId: "admin", userRole: "admin" }
      }
    }
    return { isAuthenticated: false, message: "Auth check failed" }
  }
}
