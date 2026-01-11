import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand - wider column */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-600 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-xl font-bold text-transparent">
                  Doppel Talk
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Professional voice synthesis powered by artificial
                intelligence. Transform your text into natural-sounding speech
                with cutting-edge AI technology.
              </p>
            </div>
            {/* Product */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Product
              </h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link
                    href="#features"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            {/* Support */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Support
              </h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Account Settings
                  </Link>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Legal
              </h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aup"
                    className="transition-colors hover:text-indigo-600"
                  >
                    Acceptable Use Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            <p>
              &copy; 2026{" "}
              <Link
                href="https://onreb.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                onreb.ai
              </Link>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

