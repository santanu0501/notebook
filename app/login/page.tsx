"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isRegistering) {
        // Handle Registration
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        // Auto login after registration
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          throw new Error(loginRes.error);
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        // Handle Login
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          throw new Error("Invalid credentials");
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border/40 relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">
            {isRegistering ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering 
              ? "Enter your details below to create your account" 
              : "Enter your email and password to login"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                {error}
              </div>
            )}
            
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="hello@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full font-medium" type="submit" disabled={isLoading}>
              {isLoading 
                ? "Please wait..." 
                : isRegistering ? "Sign Up" : "Sign In"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                {isRegistering ? "Sign in" : "Sign up"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
