import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hesedvhknyjcveycxdgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlc2VkdmhrbnlqY3ZleWN4ZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjAwMjAsImV4cCI6MjA3OTUzNjAyMH0.Iz3f0JBDaGohHAAaaAeoK_k7iHo3B5kCr6GihTWQ4Es'
export const supabase = createClient(supabaseUrl, supabaseKey)
