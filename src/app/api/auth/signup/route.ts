import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Content-Type check
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // 2. Parse body safely
    let body;
    try {
      body = await req.json();
    } catch (jsonErr) {
      return NextResponse.json(
        { message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // 3. Required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // 4. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // 5. Password strength (basic)
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // ────────────────────────────────────────────────
    //    TODO: Replace this with real database logic
    // ────────────────────────────────────────────────
    // Example (prisma / drizzle / mongoose / supabase / ...):
    //
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser) return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    //
    // const hashedPassword = await hashPassword(password);
    // const user = await prisma.user.create({
    //   data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword }
    // });

    // For demo only – remove in production!
    const fakeToken = "jwt_demo_" + Date.now().toString(36);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        token: fakeToken,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[SIGNUP]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}