import React from "react";

function formatInline(text: string): React.ReactNode[] {
  // Split on code, bold, italic
  const tokens: React.ReactNode[] = [];
  // Regex to match `code`, **bold**, *italic*
  const regex = /(`[^`]+`|\*\*.*?\*\*|\*.*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const chunk = match[0];
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      tokens.push(
        <code key={match.index} className="mono px-1 py-0.5 rounded bg-quiet text-brand-deep text-[11px] border border-line/40">
          {chunk.slice(1, -1)}
        </code>
      );
    } else if (chunk.startsWith("**") && chunk.endsWith("**")) {
      tokens.push(
        <strong key={match.index} className="font-semibold">
          {chunk.slice(2, -2)}
        </strong>
      );
    } else if (chunk.startsWith("*") && chunk.endsWith("*")) {
      tokens.push(
        <em key={match.index} className="italic opacity-90">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

export function MarkdownView({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 0. Code block detection (```)
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      const lang = trimmed.slice(3).trim();
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      elements.push(
        <div key={`code-${i}`} className="my-2 rounded border border-line bg-surface-subtle overflow-hidden text-xs max-w-full">
          {lang && <div className="px-3 py-1 bg-quiet/70 border-b border-line mono text-[10px] text-muted">{lang}</div>}
          <pre className="p-3 mono overflow-x-auto whitespace-pre-wrap break-all text-ink font-mono text-[12px] leading-relaxed">
            {codeLines.join("\n")}
          </pre>
        </div>
      );
      continue;
    }

    // 1. Table Detection
    const isTableDivider = i + 1 < lines.length && lines[i+1].includes("|") && lines[i+1].includes("-") && lines[i+1].replace(/[\s|:-]/g, "").length === 0;

    if (trimmed.includes("|") && isTableDivider) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (row: string) => {
          let cols = row.split("|").map(c => c.trim());
          if (cols.length > 0 && cols[0] === "") cols.shift();
          if (cols.length > 0 && cols[cols.length - 1] === "") cols.pop();
          return cols;
        };

        let headerCells = parseRow(tableLines[0]);
        let parsedBodyLines = tableLines.slice(2).map(parseRow);

        // Filter out columns that are completely empty (due to model truncation)
        const activeColumns = headerCells.map((_, colIdx) => {
          return parsedBodyLines.some(row => row[colIdx] !== undefined && row[colIdx] !== "");
        });

        headerCells = headerCells.filter((_, colIdx) => activeColumns[colIdx]);
        parsedBodyLines = parsedBodyLines.map(row => row.filter((_, colIdx) => activeColumns[colIdx]));

        // Pad rows that are still too short
        parsedBodyLines.forEach(row => {
          while (row.length < headerCells.length) {
            row.push("");
          }
        });

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-line/30 shadow-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-quiet/40 text-ink font-semibold uppercase tracking-wider border-b border-line/30">
                <tr>
                  {headerCells.map((h, colIdx) => (
                    <th key={colIdx} className="px-3.5 py-2.5">
                      {formatInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/20 bg-card text-ink">
                {parsedBodyLines.map((row, rowIdx) => {
                  return (
                    <tr key={rowIdx} className="hover:bg-quiet/30 transition-colors">
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="px-3.5 py-2.5 text-pen">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="font-serif text-base font-semibold mt-3 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-serif text-lg font-semibold mt-4 mb-1.5 border-b border-line/30 pb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-serif text-xl font-bold mt-4 mb-2">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 3. Bullet list items
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-2 space-y-1 opacity-90 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 4. Numbered list items
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 my-2 space-y-1 opacity-90 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 5. Blank line
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // 6. Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed my-1 opacity-90">
        {formatInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5 break-words [overflow-wrap:anywhere] min-w-0">{elements}</div>;
}
