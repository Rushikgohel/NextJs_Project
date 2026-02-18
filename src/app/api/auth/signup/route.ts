import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../lib/dbConfig";
import User from "@/app/models/userModel";

export const runtime = "nodejs"; // IMPORTANT for jwt & bcrypt

interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await dbConnect();

    const body: SignupRequestBody = await request.json();
    const { name, email, password } = body;

    // 🔹 Required field validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // 🔹 Name validation
    if (name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }

    // 🔹 Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // 🔹 Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // 🔹 Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // 🔹 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 🔹 Generate JWT
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// ❌ Block GET method
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
