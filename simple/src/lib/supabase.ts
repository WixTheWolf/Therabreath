// The Supabase project behind this app (flavor-playbook). The URL and the publishable key are public by design;
// environment variables override them.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvtcwgubcavwlvlmttcg.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_QAtzS-KLuj0Z8yQkYU7Wqw_iTiBBLZI';
