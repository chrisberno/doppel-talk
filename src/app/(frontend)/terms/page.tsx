import { readFileSync } from "fs";
import { join } from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TermsPage() {
  const markdownPath = join(process.cwd(), "bizops", "assets", "legal", "terms-of-service.md");
  const content = readFileSync(markdownPath, "utf-8");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="prose prose-slate max-w-none rounded-lg bg-white p-8 shadow-sm lg:prose-lg">
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
              hr: () => (
                <hr className="my-8 border-slate-200" />
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-800">{children}</strong>
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
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

