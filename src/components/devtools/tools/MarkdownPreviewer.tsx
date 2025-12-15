import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const defaultMarkdown = `# Hello World

This is a **bold** text and this is *italic*.

## Features
- Real-time preview
- GitHub-flavored markdown
- Code blocks support

### Code Example
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

[Visit GitHub](https://github.com)

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

export const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Markdown Input</label>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your markdown here..."
            className="min-h-[400px] font-mono text-sm resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Preview</label>
          <Card className="min-h-[400px] p-4 overflow-auto bg-muted/30">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 text-muted-foreground">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-3 text-muted-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 text-muted-foreground">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ className, children }) => {
                    const isBlock = className?.includes("language-");
                    return isBlock ? (
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3">
                        <code className="text-sm font-mono text-foreground">{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-3">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <table className="w-full border-collapse mb-3">{children}</table>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-3 py-2 bg-muted text-left font-medium">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-3 py-2">{children}</td>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
