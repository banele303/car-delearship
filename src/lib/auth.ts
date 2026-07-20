import { NextRequest } from "next/server"
import { convexClient } from "./convex"

interface AuthResult {
  isAuthenticated: boolean
  userId?: string
  userRole?: string
  message?: string
}

/**
 * Verifies a Convex auth token from the request headers
 */
export async function verifyAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return { isAuthenticated: false, message: "No token provided" }
  }

  try {
    const user = await convexClient.query("auth:getCurrentUser", { token })

    if (!user) {
      return { isAuthenticated: false, message: "Invalid or expired token" }
    }

    if (allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(
        (role) => role.toLowerCase() === (user.role || "").toLowerCase()
      )
      if (!hasAccess) {
        return { isAuthenticated: false, userId: user.id, message: "Access denied" }
      }
    }

    return { isAuthenticated: true, userId: user.id, userRole: user.role }
  } catch {
    return { isAuthenticated: false, message: "Auth check failed" }
  }
}
