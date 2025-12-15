import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateString, setDateString] = useState(new Date().toISOString());

  const timestampToDate = () => {
    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        toast.error("Invalid timestamp");
        return;
      }
      // Detect if milliseconds or seconds
      const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
      setDateString(date.toISOString());
    } catch {
      toast.error("Failed to convert timestamp");
    }
  };

  const dateToTimestamp = () => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        toast.error("Invalid date string");
        return;
      }
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch {
      toast.error("Failed to convert date");
    }
  };

  const setNow = () => {
    const now = new Date();
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
    setDateString(now.toISOString());
  };

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const currentDate = (() => {
    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) return null;
      const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
      return {
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        relative: getRelativeTime(date),
      };
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Current Time Button */}
      <Button onClick={setNow} variant="outline" className="w-full">
        <Clock className="w-4 h-4 mr-2" />
        Use Current Time
      </Button>

      {/* Unix Timestamp */}
      <div className="space-y-2">
        <Label>Unix Timestamp (seconds)</Label>
        <div className="flex gap-2">
          <Input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="1234567890"
            className="font-mono"
          />
          <Button onClick={timestampToDate}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => copyValue(timestamp, "Timestamp")}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Date String */}
      <div className="space-y-2">
        <Label>Date String (ISO 8601)</Label>
        <div className="flex gap-2">
          <Input
            value={dateString}
            onChange={(e) => setDateString(e.target.value)}
            placeholder="2024-01-01T00:00:00.000Z"
            className="font-mono text-sm"
          />
          <Button onClick={dateToTimestamp}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => copyValue(dateString, "Date")}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Formatted Output */}
      {currentDate && (
        <div className="space-y-3 p-4 rounded-lg bg-secondary">
          <h4 className="font-medium text-sm">Formatted Output</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local:</span>
              <span className="font-mono">{currentDate.local}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UTC:</span>
              <span className="font-mono">{currentDate.utc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISO:</span>
              <span className="font-mono text-xs">{currentDate.iso}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Relative:</span>
              <span className="font-mono">{currentDate.relative}</span>
            </div>
          </div>
        </div>
      )}

      {/* Milliseconds */}
      <div className="p-3 rounded-lg bg-muted text-sm">
        <p className="text-muted-foreground">
          <strong>Milliseconds:</strong>{" "}
          <span className="font-mono">
            {parseInt(timestamp) > 9999999999 
              ? timestamp 
              : (parseInt(timestamp) * 1000).toString()}
          </span>
        </p>
      </div>
    </div>
  );
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 0) {
    return "in the future";
  } else if (diffSecs < 60) {
    return `${diffSecs} seconds ago`;
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}
