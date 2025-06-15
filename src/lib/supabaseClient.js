import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient('https://wlupkbiafovbihwvbbfn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdXBrYmlhZm92Ymlod3ZiYmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTcxMTksImV4cCI6MjA2NTIzMzExOX0.MhGnTwlSkznLnnZxuXBZpq4cks1PXa_IAe6L8sjnpmI')