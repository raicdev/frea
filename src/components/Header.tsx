"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon, MenuIcon, XIcon, ChevronUpIcon } from "lucide-react";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showDocked, setShowDocked] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll < 50) {
        // ページ先頭付近は常に表示
        setShowDocked(true);
      } else if (currentScroll > lastScrollY) {
        // 下にスクロール中：非表示
        setShowDocked(false);
      } else {
        // 上にスクロール中：表示
        setShowDocked(true);
      }
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const MotionImage = motion(Image);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 rounded-md shadow-md ${
          showDocked
            ? "translate-y-0 bg-background"
            : "translate-y-4 bg-background mx-4"
        }`}
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? 4 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <MotionImage
                src="/frea.svg"
                alt="Logo"
                width={40}
                height={40}
                className="text-2xl"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              />
              <div className="font-bold flex items-center gap-2 text-lg bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                <span className="text-lg">Frea</span>
                <Badge variant={"outline"}>Early Access</Badge>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-6">
              {["Chat", "Dashboard"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="hover:text-gray-300 relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-500 transition-all group-hover:w-full" />
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                className="bg-gray-800 text-white pl-8 pr-4 py-1 rounded-md w-56 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Ctrl K
            </Button>
            <Button
              variant="outline"
              className="flex items-center bg-gray-800 text-white hover:bg-gray-700"
            >
              <span className="mr-2">▲</span>
              Deploy
            </Button>
            <Button className="bg-white text-black hover:bg-gray-200">
              Learn
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </Button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black pt-16 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col space-y-4 mt-8">
              {[
                "Showcase",
                "Docs",
                "Blog",
                "Templates",
                "Enterprise",
                "Learn",
              ].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-white text-xl py-2 border-b border-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScrolled && (
          <motion.button
            className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg z-50"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUpIcon size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
