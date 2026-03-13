"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Decorative background glows matching the original theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignIn
          appearance={{
            elements: {
              cardBox: "shadow-none border-border/40 bg-card/60 backdrop-blur-xl rounded-xl",
              card: "shadow-none bg-transparent",
              headerTitle: "text-3xl font-bold tracking-tight text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border-border/40 hover:bg-muted/50 bg-background/50 text-foreground",
              socialButtonsBlockButtonText: "font-medium text-foreground",
              dividerLine: "bg-border/40",
              dividerText: "text-muted-foreground bg-card/60",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background/50 border-input text-foreground focus-visible:ring-ring focus-visible:ring-offset-background",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:underline font-medium hover:text-primary",
              identityPreviewText: "text-foreground",
              identityPreviewEditButtonIcon: "text-muted-foreground",
            },
          }}
          routing="hash"
          forceRedirectUrl="/dashboard"
          signUpUrl="/register"
        />
      </div>
    </div>
  );
}
