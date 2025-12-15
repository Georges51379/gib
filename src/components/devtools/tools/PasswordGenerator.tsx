import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

export const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      toast.error("Please select at least one character type");
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    
    setPassword(result);
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "Generate a password", color: "bg-muted" };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6">
      {/* Output */}
      <div className="space-y-2">
        <Label>Generated Password</Label>
        <div className="flex gap-2">
          <Input
            value={password}
            readOnly
            placeholder="Click generate to create a password"
            className="font-mono text-lg"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            disabled={!password}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        {/* Strength Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: password ? "100%" : "0%" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{strength.label}</span>
        </div>
      </div>

      {/* Length Slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Length</Label>
          <span className="text-sm font-mono text-muted-foreground">{length}</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={([value]) => setLength(value)}
          min={8}
          max={64}
          step={1}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
          <Switch
            id="uppercase"
            checked={includeUppercase}
            onCheckedChange={setIncludeUppercase}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
          <Switch
            id="lowercase"
            checked={includeLowercase}
            onCheckedChange={setIncludeLowercase}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
          <Switch
            id="numbers"
            checked={includeNumbers}
            onCheckedChange={setIncludeNumbers}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$...)</Label>
          <Switch
            id="symbols"
            checked={includeSymbols}
            onCheckedChange={setIncludeSymbols}
          />
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={generatePassword} className="w-full" size="lg">
        <RefreshCw className="w-4 h-4 mr-2" />
        Generate Password
      </Button>
    </div>
  );
};
