import { Key, FileText, Code, Braces, Hash, Lock, Palette, Timer, Regex, Type, FileCode, GitCompare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DevTool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: "security" | "encoding" | "formatting" | "utility";
}

export const devTools: DevTool[] = [
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure, random passwords with customizable options",
    icon: Key,
    category: "security",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens locally without sending data anywhere",
    icon: Lock,
    category: "security",
  },
  {
    id: "base64",
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings instantly",
    icon: FileText,
    category: "encoding",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Validate and pretty-print JSON with syntax highlighting",
    icon: Braces,
    category: "formatting",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    icon: Hash,
    category: "security",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, and HSL color formats",
    icon: Palette,
    category: "utility",
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa",
    icon: Timer,
    category: "utility",
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random UUIDs/GUIDs",
    icon: Code,
    category: "utility",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions with live matching",
    icon: Regex,
    category: "utility",
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text for your designs and layouts",
    icon: Type,
    category: "utility",
  },
  {
    id: "markdown-previewer",
    name: "Markdown Previewer",
    description: "Write and preview markdown in real-time with syntax highlighting",
    icon: FileCode,
    category: "formatting",
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description: "Compare two text inputs and highlight differences line by line",
    icon: GitCompare,
    category: "utility",
  },
];

export const categories = [
  { id: "all", name: "All Tools" },
  { id: "security", name: "Security" },
  { id: "encoding", name: "Encoding" },
  { id: "formatting", name: "Formatting" },
  { id: "utility", name: "Utility" },
];
