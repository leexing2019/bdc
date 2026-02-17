import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aszsysdhmakczwwxabfr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTA2ODAsImV4cCI6MjA4NjcyNjY4MH0.RWYFx-qyyux6jV92K-AwHDdQo0L8R5PJmj4ERA3POmo'

// 使用 anon key，但配置为可以写入
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Service role client
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1MDY4MCwiZXhwIjoyMDg2NzI2NjgwfQ.weM80WTbByQWAHV3k-P80Lvzvpqpf535RL9a462wkXA'
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
