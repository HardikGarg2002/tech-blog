import { codeToHtml } from "shiki";
import { CodeBlock } from "./CodeBlock";

interface CodeRendererProps {
  code: string;
  lang?: string;
  filename?: string;
}

export async function CodeRenderer({ code, lang = "text", filename }: CodeRendererProps) {
  try {
    const html = await codeToHtml(code, {
      lang,
      theme: "github-dark", // You can support multiple themes later
    });

    return (
      <CodeBlock code={code} language={lang} filename={filename}>
        <div 
          dangerouslySetInnerHTML={{ __html: html }} 
          className="shiki-container ShikiHighlight" 
        />
      </CodeBlock>
    );
  } catch (error) {
    console.error("Shiki Rendering Error:", error);
    return (
      <CodeBlock code={code} language={lang} filename={filename}>
        <pre className="p-4 bg-muted/50 rounded overflow-x-auto whitespace-pre font-mono">
          {code}
        </pre>
      </CodeBlock>
    );
  }
}
