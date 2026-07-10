import { createClient } from '@supabase/supabase-js';

// These use environment variables when available. When running locally,
// create a `.env` file or set these in your environment. For now they
// fall back to placeholder strings to make the file self-contained.
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
