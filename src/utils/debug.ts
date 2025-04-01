
/**
 * Structured debug logging utility
 * @param context The source/context of the log
 * @param message Primary message
 * @param data Optional data to log
 */
export const debugLog = (context: string, message: string, data?: any) => {
  console.log(`[${context}] ${message}`, data !== undefined ? data : '');
};

/**
 * Logs error with context information
 * @param context The source/context of the error
 * @param error The error object
 * @param message Optional additional message
 */
export const debugError = (context: string, error: any, message?: string) => {
  console.error(
    `[${context}] ${message ? message + ': ' : ''}${error.message || error}`, 
    error
  );
};

/**
 * Log Supabase operation details
 * @param operation The operation being performed
 * @param table The table being accessed
 * @param payload The data being sent
 * @param result The result received
 */
export const logSupabaseOperation = (
  operation: 'insert' | 'select' | 'update' | 'delete', 
  table: string, 
  payload?: any, 
  result?: any
) => {
  console.log(`[Supabase] ${operation.toUpperCase()} on ${table}`, {
    payload: payload || 'No payload',
    result: result || 'No result yet'
  });
};
