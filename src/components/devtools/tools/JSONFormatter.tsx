import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Copy, Minimize2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const JSONFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const formatJSON = () => {
    setError(null);
    
    if (!input.trim()) {
      setError("Please enter some JSON");
      setIsValid(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON";
      setError(errorMessage);
      setIsValid(false);
      setOutput("");
    }
  };

  const minifyJSON = () => {
    setError(null);
    
    if (!input.trim()) {
      setError("Please enter some JSON");
      setIsValid(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON";
      setError(errorMessage);
      setIsValid(false);
      setOutput("");
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
    setError(null);
    setIsValid(null);
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Input JSON</Label>
          {isValid !== null && (
            <div className={`flex items-center gap-1 text-sm ${
              isValid ? "text-green-600 dark:text-green-400" : "text-destructive"
            }`}>
              {isValid ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Valid JSON
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Invalid JSON
                </>
              )}
            </div>
          )}
        </div>
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsValid(null);
            setError(null);
          }}
          placeholder='{"key": "value"}'
          className="font-mono text-sm min-h-[150px]"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={formatJSON} className="flex-1">
          Format (Pretty Print)
        </Button>
        <Button onClick={minifyJSON} variant="secondary" className="flex-1">
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Output</Label>
          <div className="flex gap-1">
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
          placeholder="Formatted output will appear here..."
          className="font-mono text-sm min-h-[200px] bg-secondary"
        />
      </div>
    </div>
  );
};
