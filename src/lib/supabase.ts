import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const supabase = createClient<Database>(
  'https://ubhogsnqucxmynhltrqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaG9nc25xdWN4bXluaGx0cnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTQxMDEsImV4cCI6MjA1ODczMDEwMX0.-PR28r_Ko_oIArh9irnct0Q8C3w7y0GIZ2-JN0UDbRs'
); 