import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - accessing VITE_ variables on server side
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuditLog {
  log_id: number;
  created_at: string;
  action_performed: string;
  user_id: string | null;
  admin_id: string | null;
  user_name: string | null;  // Added this field
  user_fullname: string | null;
  admin_fullname: string | null;
}

interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: 'date' | 'action' | 'user';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Retrieves audit logs with filtering, sorting, and pagination
 */
async function getAuditLogs(filters: AuditLogFilters): Promise<AuditLogResponse> {
  const {
    startDate,
    endDate,
    searchTerm = '',
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters;

  try {
    // Build the base query with joins to get user information
    let query = supabase
      .from('audit_log')
      .select(`
        log_id,
        created_at,
        action_performed,
        user_id,
        admin_id,
        user_name,
        user:user_id(fullname),
        admin:admin_id(fullname)
      `, { count: 'exact' });

    // Apply date range filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      // Add 1 day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      query = query.lt('created_at', endDateTime.toISOString());
    }

    // Apply sorting
    let orderColumn = 'created_at';
    if (sortBy === 'action') {
      orderColumn = 'action_performed';
    } else if (sortBy === 'user') {
      // For user sorting, we'll handle this client-side since it's from joined tables
      orderColumn = 'created_at';
    }

    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

    // Get all results first (for the date range), then apply search and pagination client-side
    const { data, error: queryError } = await query;

    if (queryError) {
      console.error('Database query error:', queryError);
      throw new Error(`Failed to fetch audit logs: ${queryError.message}`);
    }

    // Transform the data to match our interface
    const transformedLogs: AuditLog[] = (data as any[]).map(log => ({
      log_id: log.log_id,
      created_at: log.created_at,
      action_performed: log.action_performed,
      user_id: log.user_id,
      admin_id: log.admin_id,
      user_name: log.user_name,  // Include the user_name field
      user_fullname: log.user?.fullname || null,
      admin_fullname: log.admin?.fullname || null
    }));

    // Apply search filter client-side - Updated to include user_name
    let filteredLogs = transformedLogs;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredLogs = transformedLogs.filter(log => 
        log.action_performed.toLowerCase().includes(searchLower) ||
        (log.user_name && log.user_name.toLowerCase().includes(searchLower)) ||
        (log.user_fullname && log.user_fullname.toLowerCase().includes(searchLower)) ||
        (log.admin_fullname && log.admin_fullname.toLowerCase().includes(searchLower))
      );
    }

    // Handle user sorting client-side - Updated to include user_name
    if (sortBy === 'user') {
      filteredLogs.sort((a, b) => {
        const userA = a.user_name || a.user_fullname || a.admin_fullname || '';
        const userB = b.user_name || b.user_fullname || b.admin_fullname || '';
        const comparison = userA.localeCompare(userB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination client-side after search filtering
    const totalCount = filteredLogs.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      totalCount,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages
    };

  } catch (err) {
    console.error('Error fetching audit logs:', err);
    throw new Error('Failed to retrieve audit logs');
  }
}

/**
 * Creates a new audit log entry
 */
async function createAuditLog(
  actionPerformed: string,
  userId?: string,
  adminId?: string,
  userName?: string  // Added userName parameter
): Promise<void> {
  try {
    const { error: insertError } = await supabase
      .from('audit_log')
      .insert({
        action_performed: actionPerformed,
        user_id: userId || null,
        admin_id: adminId || null,
        user_name: userName || null  // Include user_name in insert
      });

    if (insertError) {
      console.error('Error creating audit log:', insertError);
      throw new Error(`Failed to create audit log: ${insertError.message}`);
    }
  } catch (err) {
    console.error('Error creating audit log:', err);
    throw new Error('Failed to create audit log entry');
  }
}

/**
 * Gets audit logs for a specific month and year
 */
async function getAuditLogsByMonth(
  month: number,
  year: number,
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  sortBy: 'date' | 'action' | 'user' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<AuditLogResponse> {
  // Calculate start and end dates for the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of the month

  return getAuditLogs({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    searchTerm,
    sortBy,
    sortOrder,
    page,
    limit
  });
}

export const load: PageServerLoad = async ({ url }) => {
  const searchParams = url.searchParams;
  
  // Extract query parameters
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const searchTerm = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sortBy') as 'date' | 'action' | 'user') || 'date';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  try {
    const auditLogData = await getAuditLogsByMonth(
      month,
      year,
      page,
      limit,
      searchTerm,
      sortBy,
      sortOrder
    );

    return {
      auditLogs: auditLogData,
      filters: {
        month,
        year,
        page,
        limit,
        searchTerm,
        sortBy,
        sortOrder
      }
    };
  } catch (err) {
    console.error('Error loading audit logs:', err);
    throw error(500, 'Failed to load audit logs');
  }
};

export const actions: Actions = {
  /**
   * Action to create a new audit log entry
   */
  createLog: async ({ request }) => {
    const formData = await request.formData();
    const actionPerformed = formData.get('action') as string;
    const userId = formData.get('userId') as string | null;
    const adminId = formData.get('adminId') as string | null;
    const userName = formData.get('userName') as string | null;  // Added userName support

    if (!actionPerformed) {
      throw error(400, 'Action is required');
    }

    try {
      await createAuditLog(actionPerformed, userId || undefined, adminId || undefined, userName || undefined);
      return { success: true };
    } catch (err) {
      console.error('Error creating audit log:', err);
      throw error(500, 'Failed to create audit log');
    }
  },

  /**
   * Action to fetch audit logs with custom filters
   */
  fetchLogs: async ({ request }) => {
    const formData = await request.formData();
    
    const filters: AuditLogFilters = {
      startDate: formData.get('startDate') as string || undefined,
      endDate: formData.get('endDate') as string || undefined,
      searchTerm: formData.get('searchTerm') as string || '',
      sortBy: (formData.get('sortBy') as 'date' | 'action' | 'user') || 'date',
      sortOrder: (formData.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(formData.get('page') as string || '1'),
      limit: parseInt(formData.get('limit') as string || '10')
    };

    try {
      const auditLogData = await getAuditLogs(filters);
      return { success: true, data: auditLogData };
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      throw error(500, 'Failed to fetch audit logs');
    }
  },

  /**
   * Action to export audit logs as CSV
   */
  exportLogs: async ({ request }) => {
    const formData = await request.formData();
    const month = parseInt(formData.get('month') as string || String(new Date().getMonth()));
    const year = parseInt(formData.get('year') as string || String(new Date().getFullYear()));
    const searchTerm = formData.get('searchTerm') as string || '';

    try {
      // Get all logs for the month (no pagination limit for export)
      const auditLogData = await getAuditLogsByMonth(
        month,
        year,
        1,
        1000, // Large limit for export
        searchTerm
      );

      // Convert to CSV format - Updated to include user_name priority
      const csvHeaders = ['Date', 'Action', 'User', 'Admin'];
      const csvRows = auditLogData.logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.action_performed,
        log.user_name || log.user_fullname || 'N/A',  // Prioritize user_name
        log.admin_fullname || 'N/A'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return {
        success: true,
        csvContent,
        filename: `audit_logs_${year}_${month + 1}.csv`
      };
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      throw error(500, 'Failed to export audit logs');
    }
  },

  // Audit logger actions that can be called from the frontend
  logUserCreation: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Created new user account', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging user creation:', err);
      throw error(500, 'Failed to log user creation');
    }
  },

  logUserUpdate: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Updated user profile', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging user update:', err);
      throw error(500, 'Failed to log user update');
    }
  },

  logUserDeletion: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Deleted user account', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging user deletion:', err);
      throw error(500, 'Failed to log user deletion');
    }
  },

  logPermissionChange: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Changed user permissions', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging permission change:', err);
      throw error(500, 'Failed to log permission change');
    }
  },

  logRoleChange: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Changed user role', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging role change:', err);
      throw error(500, 'Failed to log role change');
    }
  },

  logPasswordReset: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Reset user password', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging password reset:', err);
      throw error(500, 'Failed to log password reset');
    }
  },

  logUserView: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const adminId = formData.get('adminId') as string;
    const userName = formData.get('userName') as string;  // Added userName support
    
    try {
      await createAuditLog('Viewed user profile', userId, adminId, userName);
      return { success: true };
    } catch (err) {
      console.error('Error logging user view:', err);
      throw error(500, 'Failed to log user view');
    }
  },

  logUserGroupCreation: async ({ request }) => {
    const formData = await request.formData();
    const adminId = formData.get('adminId') as string;
    
    try {
      await createAuditLog('Created user group', undefined, adminId);
      return { success: true };
    } catch (err) {
      console.error('Error logging user group creation:', err);
      throw error(500, 'Failed to log user group creation');
    }
  },

  logDataExport: async ({ request }) => {
    const formData = await request.formData();
    const adminId = formData.get('adminId') as string;
    
    try {
      await createAuditLog('Exported user data', undefined, adminId);
      return { success: true };
    } catch (err) {
      console.error('Error logging data export:', err);
      throw error(500, 'Failed to log data export');
    }
  }
};