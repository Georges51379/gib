import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface HashResult {
  algorithm: string;
  hash: string;
}

export const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHashes = async () => {
    if (!input) {
      toast.error("Please enter some text to hash");
      return;
    }

    setIsGenerating(true);
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      
      const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      const results: HashResult[] = [];

      for (const algo of algorithms) {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        results.push({ algorithm: algo, hash: hashHex });
      }

      setHashes(results);
    } catch (error) {
      toast.error("Failed to generate hashes");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHash = async (hash: string, algo: string) => {
    await navigator.clipboard.writeText(hash);
    toast.success(`${algo} hash copied`);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <Label>Input Text</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="min-h-[100px]"
        />
      </div>

      <Button onClick={generateHashes} className="w-full" disabled={isGenerating}>
        <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
        Generate Hashes
      </Button>

      {/* Output */}
      {hashes.length > 0 && (
        <div className="space-y-3">
          <Label>Generated Hashes</Label>
          {hashes.map(({ algorithm, hash }) => (
            <div key={algorithm} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{algorithm}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyHash(hash, algorithm)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Input
                value={hash}
                readOnly
                className="font-mono text-xs bg-secondary"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Note: MD5 is not supported by Web Crypto API due to security concerns. 
        Use SHA algorithms for secure hashing.
      </p>
    </div>
  );
};
