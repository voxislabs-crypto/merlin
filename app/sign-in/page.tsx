"use client"

import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn 
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md mx-auto",
            card: "shadow-lg rounded-lg overflow-hidden",
            headerTitle: "text-2xl font-bold text-center mb-2",
            headerSubtitle: "text-center text-muted-foreground mb-6",
            socialButtonsBlockButton: "border border-input hover:bg-accent hover:text-accent-foreground",
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/80",
            formFieldInput: "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            formFieldInputPassword: "pr-10",
            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
            formFieldInputShowPasswordIcon: "h-5 w-5",
          },
        }}
      />
    </div>
  )
}
