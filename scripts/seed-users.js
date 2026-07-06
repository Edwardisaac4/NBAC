/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env.local to load configuration variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Trim wrapping quotes
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env.local');
  process.exit(1);
}

// 2. Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 3. Admin & Editor Users to provision
const users = [
  { email: 'chief.admin@nbac.com.ng', password: 'NbacAdmin2026!', role: 'head_admin' },
  { email: 'finance@nbac.com.ng', password: 'NbacAdmin2026!', role: 'head_admin' },
  { email: 'staff.editor@nbac.com.ng', password: 'NbacAdmin2026!', role: 'editor' },
  { email: 'operations@nbac.com.ng', password: 'NbacAdmin2026!', role: 'editor' },
  { email: 'support@nbac.com.ng', password: 'NbacAdmin2026!', role: 'editor' },
  { email: 'marketing@nbac.com.ng', password: 'NbacAdmin2026!', role: 'editor' },
];

async function seed() {
  console.log('Starting Supabase Auth user seeding...');
  
  for (const user of users) {
    try {
      // Check if user already exists in auth.users (we list users to check)
      const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw listError;
      }
      
      const existing = existingUsers.find((u) => u.email === user.email);
      
      if (existing) {
        console.log(`[INFO] User ${user.email} already exists. Updating metadata...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existing.id,
          {
            user_metadata: { role: user.role }
          }
        );
        if (updateError) {
          console.error(`[ERROR] Failed to update user metadata for ${user.email}:`, updateError.message);
        } else {
          console.log(`[SUCCESS] Updated ${user.email} metadata with role: ${user.role}`);
        }
      } else {
        // Create user
        const { data, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { role: user.role }
        });
        
        if (createError) {
          console.error(`[ERROR] Failed to create user ${user.email}:`, createError.message);
        } else {
          console.log(`[SUCCESS] Created user ${user.email} with role: ${user.role} (ID: ${data.user.id})`);
        }
      }
    } catch (err) {
      console.error(`[FATAL] Unexpected error processing ${user.email}:`, err.message || err);
    }
  }
  
  console.log('Seeding process finished.');
}

seed();
