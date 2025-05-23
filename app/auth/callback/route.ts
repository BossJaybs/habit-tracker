import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Handle error (e.g., redirect to an error page or show a message)
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if the user is an admin
    const user = data.session?.user;
    if (user) {
      const { data: userData, error: userError } = await supabase
        .from('users') // Assuming you have a 'users' table
        .select('role') // Assuming 'role' is a field in your users table
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        // Handle error (e.g., redirect to an error page or show a message)
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Redirect based on user role
      if (userData.role === 'admin') {
        return NextResponse.redirect(new URL("/admin", request.url)); // Redirect to admin dashboard
      }
    }
  }

  // Default redirect if no code or user is found
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
