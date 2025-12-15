import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      setMode("encode");
    } catch {
      toast.error("Failed to encode. Make sure your input is valid.");
    }
  };

  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      setMode("decode");
    } catch {
      toast.error("Failed to decode. Make sure your input is valid Base64.");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  const swap = () => {
    setInput(output);
    setOutput("");
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <Label>Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
          className="font-mono text-sm min-h-[120px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={encode} className="flex-1">
          <ArrowDown className="w-4 h-4 mr-2" />
          Encode to Base64
        </Button>
        <Button onClick={decode} variant="secondary" className="flex-1">
          <ArrowUp className="w-4 h-4 mr-2" />
          Decode from Base64
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Output {mode === "encode" ? "(Base64)" : "(Decoded)"}</Label>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={swap} disabled={!output}>
              Swap ↺
            </Button>
            <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="w-3 h-3 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          value={output}
          readOnly
          placeholder="Output will appear here..."
          className="font-mono text-sm min-h-[120px] bg-secondary"
        />
      </div>
    </div>
  );
};
