"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Redirect to login or handle unauthenticated state
      router.push("/login");
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2Icon className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-8 space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Flea Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col w-full h-full space-y-4">
        <Image
          src={user?.photoURL || "/default-avatar.png"}
          alt="User Avatar"
          width={64}
          height={64}
          className="w-16 h-16 rounded-full mb-4"
        />

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.displayName}
          </h1>
          <p className="text-muted-foreground">
            Here you can manage your account settings and view your activity.
          </p>
        </div>

        <Alert  className="md:w-3xl">
          <AlertTitle>Beta Version</AlertTitle>
          <AlertDescription>
            Thanks to trying out Frea! We are currently in beta, and we
            appreciate your feedback. If you encounter any issues or have
            suggestions, please let us know.
            <Button className="mt-2">
              <Link href="/chat">Give Feedback via Chat</Link>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col mt-4 space-y-2">
          <h1 className="text-2xl font-bold">Getting Started</h1>
          <p className="text-muted-foreground">
            Check below for some useful links to get you started with Frea.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:max-w-4xl mt-2">
            <Card className="w-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Start Chatting</CardTitle>
                <CardDescription>
                  Start chatting with your friends and colleagues instantly.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/chat" target="_blank">
                    Chat
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="w-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Check out our documentation to learn how to use Frea and its
                  features.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/docs" target="_blank">
                    View Documentation
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="w-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  API Reference <Badge variant={"outline"}>Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Explore our API reference to understand how to integrate Frea
                  with your applications.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>

            <Card className="w-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  Try Deni AI <Badge variant={"outline"}>Promotion</Badge>
                </CardTitle>
                <CardDescription>
                  A free and unlimited, Open source AI chatbot. Try it out now!
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="https://deniai.app/" target="_blank">
                    Try Deni AI

                    <ExternalLinkIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
