import { readFileSync } from "fs";
import { join } from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export default function ContactPage() {
  const markdownPath = join(
    process.cwd(),
    "assets",
    "legal",
    "contact-page-content.md",
  );
  const fullContent = readFileSync(markdownPath, "utf-8");

  // Split content at the form placeholder
  const formPlaceholder = "[CONTACT FORM PLACEHOLDER]";
  const parts = fullContent.split(formPlaceholder);
  const beforeForm = parts[0] || "";
  const afterForm = parts[1] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="prose prose-slate max-w-none space-y-8">
          {/* Content before form */}
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-4 mt-8 text-2xl font-semibold text-slate-800 sm:text-3xl">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-3 mt-6 text-xl font-semibold text-slate-800 sm:text-2xl">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-600">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-600">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-600">{children}</li>
                ),
                hr: () => <hr className="my-8 border-slate-200" />,
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-800">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {beforeForm}
            </ReactMarkdown>
          </div>

          {/* Contact Form */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="mb-6 text-2xl font-semibold text-slate-800">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-slate-700"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-slate-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Your message..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700"
                  size="lg"
                >
                  Send Message
                </Button>
                <p className="text-center text-sm text-slate-500">
                  This is a placeholder form. Functionality will be added later.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Content after form */}
          {afterForm && (
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 text-2xl font-semibold text-slate-800 sm:text-3xl">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-6 text-xl font-semibold text-slate-800 sm:text-2xl">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-slate-600 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-600">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-600">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-600">{children}</li>
                  ),
                  hr: () => <hr className="my-8 border-slate-200" />,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-800">
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {afterForm}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

