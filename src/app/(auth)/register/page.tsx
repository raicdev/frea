"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { SiGoogle, SiRefinedgithub } from "@icons-pack/react-simple-icons";

export default function RegisterPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth || !email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!", {
        description: "You've successfully registered.",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const handleProviderSignIn = async (provider: string) => {
      setIsLoading(true);
      try {
        if (!auth) {
          throw new Error("Firebase auth is not initialized");
        }
        const oauthProvider = new OAuthProvider(provider);
        await signInWithPopup(auth, oauthProvider);
        
        toast.success(`Signed in with ${provider} successfully!`);
        router.push("/dashboard");
      } catch (error: any) {
        toast.error("Sign in failed", {
          description: error.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
      }
    };
  

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email and password below to register
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </CardFooter>
        </form>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col items-center space-y-2 px-4">
          <Button
            variant="outline"
            onClick={() => handleProviderSignIn("google.com")}
            disabled={isLoading}
            className="w-full"
          >
            <SiGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleProviderSignIn("github.com")}
            disabled={isLoading}
            className="w-full"
          >
            <SiRefinedgithub className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Button
            variant="link"
            onClick={() => router.push("/login")}
            className="p-0"
          >
            Sign in
          </Button>
        </div>
      </Card>
    </div>
  );
}
