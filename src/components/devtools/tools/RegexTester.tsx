import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface MatchResult {
  match: string;
  index: number;
  groups?: { [key: string]: string };
}

export const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      setIsValid(null);
      return;
    }

    try {
      const flagString = 
        (flags.global ? "g" : "") + 
        (flags.ignoreCase ? "i" : "") + 
        (flags.multiline ? "m" : "");
      
      const regex = new RegExp(pattern, flagString);
      setError(null);
      setIsValid(true);

      if (!testString) {
        setMatches([]);
        return;
      }

      const foundMatches: MatchResult[] = [];
      let match: RegExpExecArray | null;

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.groups,
          });
          if (!flags.global) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }

      setMatches(foundMatches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid regex pattern");
      setIsValid(false);
      setMatches([]);
    }
  }, [pattern, testString, flags]);

  const copyPattern = async () => {
    if (!pattern) return;
    await navigator.clipboard.writeText(pattern);
    toast.success("Pattern copied to clipboard");
  };

  const clear = () => {
    setPattern("");
    setTestString("");
    setMatches([]);
    setError(null);
    setIsValid(null);
  };

  const highlightMatches = () => {
    if (!testString || matches.length === 0) return testString;
    
    let result = testString;
    let offset = 0;
    
    matches.forEach((match) => {
      const start = match.index + offset;
      const end = start + match.match.length;
      const before = result.substring(0, start);
      const matchText = result.substring(start, end);
      const after = result.substring(end);
      result = before + `【${matchText}】` + after;
      offset += 2;
    });
    
    return result;
  };

  return (
    <div className="space-y-4">
      {/* Pattern Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Regex Pattern</Label>
          {isValid !== null && (
            <div className="flex items-center gap-1 text-sm">
              {isValid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Valid</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">Invalid</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="font-mono text-sm pl-6 pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
          </div>
          <Button variant="outline" size="icon" onClick={copyPattern} disabled={!pattern}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="global"
            checked={flags.global}
            onCheckedChange={(checked) => setFlags({ ...flags, global: !!checked })}
          />
          <Label htmlFor="global" className="text-sm cursor-pointer">
            Global (g)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="ignoreCase"
            checked={flags.ignoreCase}
            onCheckedChange={(checked) => setFlags({ ...flags, ignoreCase: !!checked })}
          />
          <Label htmlFor="ignoreCase" className="text-sm cursor-pointer">
            Ignore Case (i)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="multiline"
            checked={flags.multiline}
            onCheckedChange={(checked) => setFlags({ ...flags, multiline: !!checked })}
          />
          <Label htmlFor="multiline" className="text-sm cursor-pointer">
            Multiline (m)
          </Label>
        </div>
      </div>

      {/* Test String */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Test String</Label>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="w-3 h-3 mr-1" /> Clear All
          </Button>
        </div>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against the pattern..."
          className="font-mono text-sm min-h-[100px]"
        />
      </div>

      {/* Results */}
      <div className="space-y-2">
        <Label>
          Matches ({matches.length})
        </Label>
        {matches.length > 0 ? (
          <div className="space-y-2">
            <div className="p-3 bg-secondary rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
              {highlightMatches()}
            </div>
            <div className="max-h-[150px] overflow-y-auto space-y-1">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <span className="font-mono">{match.match}</span>
                  <span className="text-muted-foreground text-xs">
                    Index: {match.index}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : testString && pattern && isValid ? (
          <p className="text-muted-foreground text-sm">No matches found</p>
        ) : (
          <p className="text-muted-foreground text-sm">Enter a pattern and test string to see matches</p>
        )}
      </div>
    </div>
  );
};
