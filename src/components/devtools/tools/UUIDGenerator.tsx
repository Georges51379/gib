import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const UUIDGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);

  const generateUUID = () => {
    return crypto.randomUUID();
  };

  const generateMultiple = () => {
    const newUuids = Array.from({ length: Math.min(count, 100) }, () => generateUUID());
    setUuids(newUuids);
  };

  const copyUUID = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
    toast.success("UUID copied");
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    toast.success(`${uuids.length} UUIDs copied`);
  };

  const clear = () => {
    setUuids([]);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Label>Count (1-100)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={generateMultiple} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Output */}
      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Generated UUIDs ({uuids.length})</Label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={copyAll}>
                <Copy className="w-3 h-3 mr-1" /> Copy All
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                <Trash2 className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <code className="flex-1 font-mono text-sm">{uuid}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyUUID(uuid)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
        <p>
          Generated using <code className="bg-background px-1 rounded">crypto.randomUUID()</code> — 
          cryptographically secure random UUIDs (v4).
        </p>
      </div>
    </div>
  );
};
