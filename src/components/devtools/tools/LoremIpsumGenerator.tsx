import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "nihil", "impedit", "quo", "minus",
];

type OutputType = "words" | "sentences" | "paragraphs";

export const LoremIpsumGenerator = () => {
  const [count, setCount] = useState(5);
  const [outputType, setOutputType] = useState<OutputType>("paragraphs");
  const [output, setOutput] = useState("");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const getRandomWord = () => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateSentence = (wordCount: number = 0): string => {
    const length = wordCount || Math.floor(Math.random() * 10) + 5;
    const words: string[] = [];
    
    for (let i = 0; i < length; i++) {
      words.push(getRandomWord());
    }
    
    return capitalize(words.join(" ")) + ".";
  };

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    
    return sentences.join(" ");
  };

  const generate = () => {
    let result = "";

    switch (outputType) {
      case "words": {
        const words: string[] = [];
        for (let i = 0; i < count; i++) {
          words.push(getRandomWord());
        }
        result = words.join(" ");
        if (startWithLorem && count >= 2) {
          const wordsArray = result.split(" ");
          wordsArray[0] = "lorem";
          wordsArray[1] = "ipsum";
          result = wordsArray.join(" ");
        }
        break;
      }
      case "sentences": {
        const sentences: string[] = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(" ");
        if (startWithLorem && count >= 1) {
          result = "Lorem ipsum dolor sit amet. " + result.substring(result.indexOf(".") + 2);
        }
        break;
      }
      case "paragraphs": {
        const paragraphs: string[] = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join("\n\n");
        if (startWithLorem && count >= 1) {
          result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + 
            result.substring(result.indexOf(".") + 2);
        }
        break;
      }
    }

    setOutput(result);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const clear = () => {
    setOutput("");
  };

  return (
    <div className="space-y-4">
      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Generate</Label>
          <RadioGroup
            value={outputType}
            onValueChange={(value) => setOutputType(value as OutputType)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="words" id="words" />
              <Label htmlFor="words" className="cursor-pointer">Words</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sentences" id="sentences" />
              <Label htmlFor="sentences" className="cursor-pointer">Sentences</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paragraphs" id="paragraphs" />
              <Label htmlFor="paragraphs" className="cursor-pointer">Paragraphs</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="count">Count</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-24"
          />
        </div>
      </div>

      {/* Start with Lorem option */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="startWithLorem"
          checked={startWithLorem}
          onChange={(e) => setStartWithLorem(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="startWithLorem" className="cursor-pointer text-sm">
          Start with "Lorem ipsum..."
        </Label>
      </div>

      {/* Generate Button */}
      <Button onClick={generate} className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" />
        Generate Lorem Ipsum
      </Button>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Output</Label>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={clear} disabled={!output}>
              <Trash2 className="w-3 h-3 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          value={output}
          readOnly
          placeholder="Click 'Generate' to create Lorem Ipsum text..."
          className="font-mono text-sm min-h-[150px] bg-secondary"
        />
        {output && (
          <p className="text-xs text-muted-foreground">
            {output.split(/\s+/).length} words, {output.length} characters
          </p>
        )}
      </div>
    </div>
  );
};
