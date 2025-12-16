import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

/** Validate that `next` is a safe internal path (relative and starts with /) */
function sanitizeNext(nextParam: string | null | undefined): string {
  if (!nextParam) return '/';
  // Only allow relative paths starting with '/'
  try {
    const decoded = decodeURIComponent(nextParam);
    if (decoded.startsWith('/') && !decoded.startsWith('//')) {
      // Prevent protocol-relative URLs like //evil.com
      return decoded;
    }
  } catch {
    // ignore decode errors
  }
  return '/';
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token_hash = url.searchParams.get('token_hash');
    const typeParam = url.searchParams.get('type'); // expected: 'magiclink' | 'signup' | 'recovery'
    const nextParam = url.searchParams.get('next');

    // Parameter validation
    if (!token_hash || !typeParam) {
      const redirectUrl = `/login?error=${encodeURIComponent('missing_token_or_type')}`;
      return NextResponse.redirect(new URL(redirectUrl, url.origin));
    }

    // Type-safety: cast to EmailOtpType where appropriate
    const type = typeParam as EmailOtpType;

    // Create a server Supabase client bound to the incoming request
    const supabase = createServerClient();

    // Verify the OTP/token_hash (this validates and establishes a session)
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });

    if (error) {
      // Categorize common errors if you'd like, otherwise return generic verification_failed
      const errCode = encodeURIComponent(error.message ?? 'verification_failed');
      const redirectUrl = `/login?error=${errCode}`;
      return NextResponse.redirect(new URL(redirectUrl, url.origin));
    }

    // On success, redirect to sanitized next or root
    const destination = sanitizeNext(nextParam);
    return NextResponse.redirect(new URL(destination, url.origin));

  } catch (err) {
    // Log server-side for diagnostics (avoid leaking secrets)
    console.error('Auth callback failed:', err);
    const redirectUrl = `/login?error=${encodeURIComponent('unexpected_error')}`;
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
}
