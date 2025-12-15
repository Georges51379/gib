import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const ColorConverter = () => {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    const rgbValue = hexToRgb(value);
    if (rgbValue) {
      setRgb(rgbValue);
      setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    }
  };

  const handleRgbChange = (key: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgb, [key]: Math.min(255, Math.max(0, value)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (key: "h" | "s" | "l", value: number) => {
    const max = key === "h" ? 360 : 100;
    const newHsl = { ...hsl, [key]: Math.min(max, Math.max(0, value)) };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="space-y-6">
      {/* Color Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-xl border-2 border-border shadow-lg"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1">
          <Input
            type="color"
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full h-12 cursor-pointer"
          />
        </div>
      </div>

      {/* HEX */}
      <div className="space-y-2">
        <Label>HEX</Label>
        <div className="flex gap-2">
          <Input
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            className="font-mono"
            placeholder="#000000"
          />
          <Button variant="outline" size="icon" onClick={() => copyValue(hex, "HEX")}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* RGB */}
      <div className="space-y-2">
        <Label>RGB</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">R</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) => handleRgbChange("r", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">G</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) => handleRgbChange("g", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">B</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) => handleRgbChange("b", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <Button variant="outline" size="icon" className="self-end" onClick={() => copyValue(rgbString, "RGB")}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* HSL */}
      <div className="space-y-2">
        <Label>HSL</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">H</span>
            <Input
              type="number"
              min={0}
              max={360}
              value={hsl.h}
              onChange={(e) => handleHslChange("h", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">S%</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={hsl.s}
              onChange={(e) => handleHslChange("s", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">L%</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) => handleHslChange("l", parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
          <Button variant="outline" size="icon" className="self-end" onClick={() => copyValue(hslString, "HSL")}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
