/**
 * Admin Panel Configuration
 * 
 * Security configuration for the admin panel including
 * session settings and feature flags.
 * 
 * NOTE: Admin authorization is now handled via the `is_admin` column
 * in the users table (database-backed), not via frontend phone whitelist.
 */

export const adminConfig = {
    // Session configuration
    sessionDuration: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    sessionWarning: 10 * 60 * 1000,      // Warn 10 minutes before expiry

    // Security settings
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes lockout

    // Feature flags for admin capabilities
    features: {
        productManagement: true,
        userManagement: true,
        requestManagement: true,
        analytics: true,
        auditLogs: true,
        imageManagement: true,
    }
}

/**
 * Format remaining session time for display
 * @param milliseconds - Remaining time in milliseconds
 * @returns Formatted string like "2h 30m" or "5m 30s"
 */
export function formatSessionTime(milliseconds: number): string {
    if (milliseconds <= 0) return 'Expired'

    const hours = Math.floor(milliseconds / (60 * 60 * 1000))
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    } else {
        return `${seconds}s`
    }
}
