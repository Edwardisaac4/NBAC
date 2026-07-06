---
name: supabase-integration
description: Guidelines and patterns for Supabase Database, Auth, Storage, and Middleware setup in the NBAC platform.
---

# Supabase Integration — NBAC Platform

This skill establishes standard instructions and guidelines for integrating Supabase into the NBAC Next.js App Router codebase.

---

## 1. Client Helper Usage

Always use the dedicated helper clients instead of instantiating new `createClient` calls directly.

- **Browser/Client Components (`'use client'`)**:
  ```ts
  import { createClient } from '@/lib/supabase/client'
  const supabase = createClient()
  ```
- **Server Components, Actions, and Route Handlers**:
  ```ts
  import { createClient } from '@/lib/supabase/server'
  const supabase = await createClient()
  ```

---

## 2. Authentication & Admin Roles

- Delegates/visitors do **not** have accounts or logins. Only the **5 internal admins** use Supabase Auth.
- Admin roles are retrieved from `user_metadata.role` (either `'head_admin'` or `'editor'`).
- Always gate delete actions, logs, and downloads with `head_admin` check:
  ```ts
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role
  
  if (role !== 'head_admin') {
    // Return unauthorized or hide element
  }
  ```

---

## 3. Database Operations & Audit Logs

- When querying database tables, ensure results match TypeScript definitions in `types/index.ts`.
- Every admin mutation (insert, update, delete) automatically inserts a security audit log into the `audit_logs` table via a PostgreSQL database trigger. **Do not write manual insertions to `audit_logs` from Next.js server code.**
---

## 4. Storage Integration

- Place conference assets and media in the `media` storage bucket.
- Save public URLs and reference paths correctly inside the `media` metadata database table.
