"use client";

import { useTitle } from "@/hooks/use-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRightIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SiFirebase,
  SiNextdotjs,
  SiReact,
  SiShadcnui,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default function Home() {
  useTitle("Home | Frea (Beta)", false);

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted text-foreground px-4">
        <div className="group relative mx-auto flex items-center justify-center mb-4 rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
          <span
            className={cn(
              "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
            )}
            style={{
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "destination-out",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "subtract",
              WebkitClipPath: "padding-box",
            }}
          />
          🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
          <AnimatedGradientText className="text-sm font-medium">
            Public Beta is now live!
          </AnimatedGradientText>
          <ChevronRightIcon
            className="ml-1 size-4 stroke-neutral-500 transition-transform
 duration-300 ease-in-out group-hover:translate-x-0.5"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-primary">Frea</span> - Connect Instantly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            The simple, secure, and reliable way to chat with friends and
            colleagues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/chat">
                <SparklesIcon className="mr-2 h-4 w-4" /> Start Chatting
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-4">Used technologies</p>
          <div className="flex justify-center gap-2 space-x-8">
            <SiNextdotjs className="h-8 w-8" />
            <SiVercel className="h-8 w-8" />
            <SiFirebase className="h-8 w-8" />
            <SiReact className="h-8 w-8" />
            <SiShadcnui className="h-8 w-8" />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto mt-24 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why choose Frea?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/50 p-6 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Messaging</h3>
            <p className="text-muted-foreground">
              We don't store your messages. Your conversations are private and
              secure.
            </p>
          </div>

          <div className="bg-card/50 p-6 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Real-time messaging with minimal latency for the most responsive
              chat experience.
            </p>
          </div>

          <div className="bg-card/50 p-6 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-muted-foreground">
              Intuitive interface that makes staying connected with your
              contacts simple and enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section
      <section className="w-full max-w-6xl mx-auto mt-24 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card/30 p-6 rounded-lg border border-border/50">
            <p className="italic text-muted-foreground mb-4">
              "Frea has completely transformed how my team communicates. The
              interface is clean and the app is incredibly fast."
            </p>
            <div className="flex items-center">
              <div className="rounded-full bg-primary/20 w-10 h-10 flex items-center justify-center mr-3">
                JS
              </div>
              <div>
                <p className="font-medium">Jamie Smith</p>
                <p className="text-sm text-muted-foreground">Product Manager</p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 p-6 rounded-lg border border-border/50">
            <p className="italic text-muted-foreground mb-4">
              "I've tried many messaging apps, but Frea stands out with its
              simplicity and reliability. It just works!"
            </p>
            <div className="flex items-center">
              <div className="rounded-full bg-primary/20 w-10 h-10 flex items-center justify-center mr-3">
                AC
              </div>
              <div>
                <p className="font-medium">Alex Chen</p>
                <p className="text-sm text-muted-foreground">
                  Software Developer
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="w-full max-w-5xl mx-auto mt-24 mb-16 px-4">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to experience better messaging?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already made the switch to Frea for
            faster, more secure communication.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link href="/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
