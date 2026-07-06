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

// 3. Parse users list from environment configuration
let users = [];
try {
  if (!process.env.SEED_USERS_CONFIG) {
    console.error('ERROR: SEED_USERS_CONFIG environment variable is missing in .env.local.');
    process.exit(1);
  }
  users = JSON.parse(process.env.SEED_USERS_CONFIG);
  if (!Array.isArray(users)) {
    throw new Error('Parsed config is not an array');
  }
} catch (err) {
  console.error('ERROR: Failed to parse SEED_USERS_CONFIG environment variable as JSON:', err.message);
  process.exit(1);
}

async function seed() {
  console.log('Starting Supabase Auth user seeding...');
  
  // 4. Fetch all existing users with explicit pagination
  const existingUsersMap = new Map();
  let page = 1;
  const limit = 100;
  
  try {
    console.log('Fetching existing users from Supabase Auth...');
    while (true) {
      const { data, error: listError } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: limit
      });
      
      if (listError) {
        throw listError;
      }
      
      const usersList = data?.users || [];
      if (usersList.length === 0) {
        break;
      }
      
      for (const u of usersList) {
        if (u.email) {
          existingUsersMap.set(u.email.toLowerCase(), u);
        }
      }
      
      if (usersList.length < limit) {
        break;
      }
      page++;
    }
    console.log(`Successfully preloaded ${existingUsersMap.size} existing users.`);
  } catch (err) {
    console.error('[FATAL] Failed to fetch existing users:', err.message || err);
    process.exit(1);
  }
  
  for (const user of users) {
    try {
      const existing = existingUsersMap.get(user.email.toLowerCase());
      
      if (existing) {
        console.log(`[INFO] User ${user.email} already exists. Updating metadata...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existing.id,
          {
            app_metadata: { role: user.role }
          }
        );
        if (updateError) {
          console.error(`[ERROR] Failed to update user app_metadata for ${user.email}:`, updateError.message);
        } else {
          console.log(`[SUCCESS] Updated ${user.email} app_metadata with role: ${user.role}`);
        }
      } else {
        if (!user.password) {
          console.error(`[ERROR] Cannot create new user ${user.email}: Password is not provided in SEED_USERS_CONFIG.`);
          continue;
        }
        // Create user
        const { data, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          app_metadata: { role: user.role }
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
