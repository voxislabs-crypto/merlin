import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
  }
  
  // Example: Get user profile data
  try {
    // Here you would typically fetch user data from your database
    // For now, we'll return a mock response
    return NextResponse.json({
      message: "User profile retrieved successfully",
      userId,
      profile: {
        // This would come from your database or Clerk metadata
        onboardingCompleted: true,
        // Add other profile fields as needed
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
