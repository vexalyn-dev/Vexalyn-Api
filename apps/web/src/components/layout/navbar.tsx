"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "API", href: "#api" },
    { label: "Documentation", href: "#docs" },
    { label: "Pricing", href: "#pricing" },
    { label: "Playground", href: "#playground" },
  ]

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 shadow-md shadow-violet-600/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              VEXALYN API
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
            <button
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-foreground">VEXALYN API</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <div className="mt-12 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
