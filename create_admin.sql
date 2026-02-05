-- Create Admin User Script
-- Run this in the Supabase SQL Editor

-- 1. Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define variables for the new user
DO $$
DECLARE
  new_email TEXT := 'admin@lite.com'; -- CHANGE THIS
  new_password TEXT := 'admin123';    -- CHANGE THIS
  new_user_id UUID := gen_random_uuid();
  encrypted_pw TEXT;
BEGIN
  -- Generate encrypted password
  encrypted_pw := crypt(new_password, gen_salt('bf'));

  -- 3. Insert into auth.users
  -- We use ON CONFLICT DO NOTHING to avoid errors if the user already exists,
  -- but ideally check first or handle updates if needed.
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated', -- Supabase auth role
    new_email,
    encrypted_pw,
    NOW(), -- email_confirmed_at (auto confirm)
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "System Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- 4. Get the user ID (in case they already existed and we didn't insert)
  SELECT id INTO new_user_id FROM auth.users WHERE email = new_email;

  -- 5. Insert or Update public.profiles to set role as admin
  -- We assume a trigger might auto-create the profile on auth.users insert,
  -- so we use ON CONFLICT to update the role.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new_user_id, 'System Admin', 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      full_name = EXCLUDED.full_name;

  RAISE NOTICE 'Admin user created/updated: % (Password: %)', new_email, new_password;

END $$;
