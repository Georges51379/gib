import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DevTool } from "@/data/devToolsConfig";
import { PasswordGenerator } from "./tools/PasswordGenerator";
import { JWTDecoder } from "./tools/JWTDecoder";
import { Base64Tool } from "./tools/Base64Tool";
import { JSONFormatter } from "./tools/JSONFormatter";
import { HashGenerator } from "./tools/HashGenerator";
import { ColorConverter } from "./tools/ColorConverter";
import { TimestampConverter } from "./tools/TimestampConverter";
import { UUIDGenerator } from "./tools/UUIDGenerator";
import { RegexTester } from "./tools/RegexTester";
import { LoremIpsumGenerator } from "./tools/LoremIpsumGenerator";
import { MarkdownPreviewer } from "./tools/MarkdownPreviewer";
import { DiffChecker } from "./tools/DiffChecker";

interface DevToolModalProps {
  tool: DevTool | null;
  onClose: () => void;
}

const toolComponents: Record<string, React.ComponentType> = {
  "password-generator": PasswordGenerator,
  "jwt-decoder": JWTDecoder,
  "base64": Base64Tool,
  "json-formatter": JSONFormatter,
  "hash-generator": HashGenerator,
  "color-converter": ColorConverter,
  "timestamp-converter": TimestampConverter,
  "uuid-generator": UUIDGenerator,
  "regex-tester": RegexTester,
  "lorem-ipsum": LoremIpsumGenerator,
  "markdown-previewer": MarkdownPreviewer,
  "diff-checker": DiffChecker,
};

export const DevToolModal = ({ tool, onClose }: DevToolModalProps) => {
  if (!tool) return null;

  const ToolComponent = toolComponents[tool.id];
  const Icon = tool.icon;

  return (
    <Dialog open={!!tool} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">{tool.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {tool.description}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {ToolComponent ? <ToolComponent /> : <div>Tool not implemented yet</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
