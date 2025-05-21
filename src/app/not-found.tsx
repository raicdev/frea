"use client";

import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/use-title";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function NotFound() {
  useTitle("404 - Page Not Found");
  const [showGame, setShowGame] = useState(false);
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Secret game logic
  const startGame = () => {
    setShowGame(true);
    setScore(0);
  };

  const moveTarget = () => {
    setPosition({
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10,
    });
    setScore(score + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      
      <div className="space-x-4">
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
        
        <Button 
          variant="outline"
          onClick={() => startGame()}
          className={cn("relative", { "animate-pulse": showGame })}
        >
          {showGame ? "Playing..." : "I'm feeling lucky"}
          {/* Secret game hint */}
          {!showGame && <span className="absolute -top-2 -right-2 text-xs text-muted-foreground">?</span>}
        </Button>
      </div>
      
      {showGame && (
        <div className="mt-8 border rounded-lg p-4 w-full max-w-md">
          <div className="text-sm mb-2">Secret Game: Click the dot! Score: {score}</div>
          <div className="relative bg-muted h-64 rounded-md overflow-hidden">
            <div 
              className="absolute w-5 h-5 bg-primary rounded-full cursor-pointer transition-all duration-200"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={moveTarget}
            />
          </div>
          <Button size="sm" className="mt-4" onClick={() => setShowGame(false)}>
            End Game
          </Button>
        </div>
      )}
    </div>
  );
}
