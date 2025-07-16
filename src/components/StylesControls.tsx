"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultStyles,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  MARGIN_OPTIONS,
  PAPER_SIZES,
  PaperSize,
  ResumeStyles,
  SYSTEM_FONTS,
} from "@/lib/utils/styles";
import {
  ArrowLeftRight,
  ArrowUpDown,
  CaseUpperIcon,
  FileText,
  LetterText,
  RotateCcw,
  Type,
} from "lucide-react";

interface StylesControlsProps {
  styles: ResumeStyles;
  onStylesChange: (styles: ResumeStyles) => void;
}

export default function StylesControls({
  styles,
  onStylesChange,
}: StylesControlsProps) {
  const handleStyleChange = (
    key: keyof ResumeStyles,
    value: string | number,
  ) => {
    onStylesChange({
      ...styles,
      [key]: value,
    });
  };

  return (
    <div className="p-4 bg-background border-b">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="paperSize">
            <FileText className="w-4 h-4 mr-1" />
            Paper Size
          </Label>
          <Select
            value={styles.paperSize}
            onValueChange={(value: PaperSize) =>
              handleStyleChange("paperSize", value)
            }
          >
            <SelectTrigger id="paperSize">
              <SelectValue placeholder="Select paper size" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PAPER_SIZES).map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="fontFamily">
            <Type className="w-4 h-4 mr-1" />
            Font Family
          </Label>
          <Select
            value={styles.fontFamily}
            onValueChange={(value) => handleStyleChange("fontFamily", value)}
          >
            <SelectTrigger id="fontFamily">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span
                    style={{
                      fontFamily: SYSTEM_FONTS.includes(font)
                        ? font.replace(/\+/g, " ")
                        : `"${font.replace(/\+/g, " ")}", sans-serif`,
                    }}
                  >
                    {font.replace(/\+/g, " ")}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="fontSize">
            <CaseUpperIcon className="w-4 h-4 mr-1" />
            Font Size
          </Label>
          <Select
            value={styles.fontSize.toString()}
            onValueChange={(value) =>
              handleStyleChange("fontSize", parseFloat(value))
            }
          >
            <SelectTrigger id="fontSize">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="lineHeight">
            <LetterText className="w-4 h-4 mr-1" />
            Line Height
          </Label>
          <Select
            value={styles.lineHeight.toString()}
            onValueChange={(value) =>
              handleStyleChange("lineHeight", parseFloat(value))
            }
          >
            <SelectTrigger id="lineHeight">
              <SelectValue placeholder="Select line height" />
            </SelectTrigger>
            <SelectContent>
              {LINE_HEIGHT_OPTIONS.map((height) => (
                <SelectItem key={height} value={height}>
                  {height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="marginH">
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            Horizontal Margin
          </Label>
          <Select
            value={styles.marginH.toString()}
            onValueChange={(value) =>
              handleStyleChange("marginH", parseInt(value))
            }
          >
            <SelectTrigger id="marginH">
              <SelectValue placeholder="Select margin" />
            </SelectTrigger>
            <SelectContent>
              {MARGIN_OPTIONS.map((margin) => (
                <SelectItem key={margin} value={margin.toString()}>
                  {margin}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center" htmlFor="marginV">
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Vertical Margin
          </Label>
          <Select
            value={styles.marginV.toString()}
            onValueChange={(value) =>
              handleStyleChange("marginV", parseInt(value))
            }
          >
            <SelectTrigger id="marginV">
              <SelectValue placeholder="Select margin" />
            </SelectTrigger>
            <SelectContent>
              {MARGIN_OPTIONS.map((margin) => (
                <SelectItem key={margin} value={margin.toString()}>
                  {margin}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStylesChange(defaultStyles)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
