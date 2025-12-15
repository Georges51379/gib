import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export const JWTDecoder = () => {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decodeJWT = () => {
    setError(null);
    setDecoded(null);

    if (!token.trim()) {
      setError("Please enter a JWT token");
      return;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        setError("Invalid JWT format. A JWT should have 3 parts separated by dots.");
        return;
      }

      // Decode header
      const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      
      // Decode payload
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      
      // Signature (keep as-is, can't decode without secret)
      const signature = parts[2];

      setDecoded({ header, payload, signature });
    } catch {
      setError("Failed to decode JWT. Make sure it's a valid token.");
    }
  };

  const copySection = async (section: string, data: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success(`${section} copied to clipboard`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = decoded?.payload?.exp 
    ? (decoded.payload.exp as number) * 1000 < Date.now()
    : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <Label>JWT Token</Label>
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="font-mono text-sm min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          🔒 Your token is decoded entirely in your browser. Nothing is sent to any server.
        </p>
      </div>

      <Button onClick={decodeJWT} className="w-full">
        Decode Token
      </Button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Decoded Output */}
      {decoded && (
        <div className="space-y-4">
          {/* Expiry Status */}
          {isExpired !== null && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isExpired 
                ? "bg-destructive/10 text-destructive" 
                : "bg-green-500/10 text-green-600 dark:text-green-400"
            }`}>
              {isExpired ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm">
                {isExpired 
                  ? `Token expired on ${formatDate(decoded.payload.exp as number)}`
                  : `Token valid until ${formatDate(decoded.payload.exp as number)}`
                }
              </span>
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-primary">Header</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySection("Header", decoded.header)}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-secondary text-sm font-mono overflow-x-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-primary">Payload</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySection("Payload", decoded.payload)}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-secondary text-sm font-mono overflow-x-auto max-h-[300px]">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Signature (encoded)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySection("Signature", decoded.signature)}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-secondary text-sm font-mono overflow-x-auto text-muted-foreground">
              {decoded.signature}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
