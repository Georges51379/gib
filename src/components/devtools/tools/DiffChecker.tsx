import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, ArrowLeftRight } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: { left?: number; right?: number };
}

export const DiffChecker = () => {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");

  const diffLines = useMemo((): DiffLine[] => {
    if (!leftText && !rightText) return [];

    const leftLines = leftText.split("\n");
    const rightLines = rightText.split("\n");
    const result: DiffLine[] = [];

    const maxLength = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLength; i++) {
      const leftLine = leftLines[i];
      const rightLine = rightLines[i];

      if (leftLine === undefined && rightLine !== undefined) {
        result.push({
          type: "added",
          content: rightLine,
          lineNumber: { right: i + 1 },
        });
      } else if (leftLine !== undefined && rightLine === undefined) {
        result.push({
          type: "removed",
          content: leftLine,
          lineNumber: { left: i + 1 },
        });
      } else if (leftLine !== rightLine) {
        result.push({
          type: "removed",
          content: leftLine,
          lineNumber: { left: i + 1 },
        });
        result.push({
          type: "added",
          content: rightLine,
          lineNumber: { right: i + 1 },
        });
      } else {
        result.push({
          type: "unchanged",
          content: leftLine,
          lineNumber: { left: i + 1, right: i + 1 },
        });
      }
    }

    return result;
  }, [leftText, rightText]);

  const stats = useMemo(() => {
    const added = diffLines.filter((l) => l.type === "added").length;
    const removed = diffLines.filter((l) => l.type === "removed").length;
    const unchanged = diffLines.filter((l) => l.type === "unchanged").length;
    return { added, removed, unchanged };
  }, [diffLines]);

  const clear = () => {
    setLeftText("");
    setRightText("");
  };

  const swap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  return (
    <div className="space-y-4">
      {/* Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Original Text</Label>
          <Textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Paste original text here..."
            className="font-mono text-sm min-h-[150px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Modified Text</Label>
          <Textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Paste modified text here..."
            className="font-mono text-sm min-h-[150px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={swap}>
            <ArrowLeftRight className="w-3 h-3 mr-1" /> Swap
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="w-3 h-3 mr-1" /> Clear
          </Button>
        </div>
        {(leftText || rightText) && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-500">+{stats.added} added</span>
            <span className="text-red-500">-{stats.removed} removed</span>
            <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
          </div>
        )}
      </div>

      {/* Diff Output */}
      <div className="space-y-2">
        <Label>Differences</Label>
        {diffLines.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border">
            {diffLines.map((line, index) => (
              <div
                key={index}
                className={`flex font-mono text-sm ${
                  line.type === "added"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : line.type === "removed"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-transparent"
                }`}
              >
                <div className="w-8 flex-shrink-0 px-2 py-1 text-right text-muted-foreground border-r border-border bg-muted/50">
                  {line.lineNumber.left || line.lineNumber.right || ""}
                </div>
                <div className="w-6 flex-shrink-0 px-1 py-1 text-center font-bold">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </div>
                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                  {line.content || " "}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Enter text in both fields to see differences
          </p>
        )}
      </div>
    </div>
  );
};
