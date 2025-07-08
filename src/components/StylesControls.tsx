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
  PAPER_SIZES,
  PaperSize,
  ResumeStyles,
  SYSTEM_FONTS,
} from "@/lib/utils/styles";

interface StylesControlsProps {
  styles: ResumeStyles;
  onStylesChange: (styles: ResumeStyles) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open+Sans",
  "Lato",
  "Montserrat",
  "Georgia",
  "Times+New+Roman",
  "Arial",
  "Poppins",
  "Playfair+Display",
  "Source+Sans+Pro",
  "Merriweather",
];

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
    <div className="p-4 space-y-4 bg-background border-b">
      <div className="flex flex-row items-end justify-start gap-2">
        <div className="space-y-1">
          <Label className="text-xs" htmlFor="paperSize">
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
          <Label className="text-xs" htmlFor="fontFamily">
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
          <Label className="text-xs" htmlFor="fontSize">
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
              {Array.from({ length: 17 }, (_, i) => 8 + i * 0.5).map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs" htmlFor="lineHeight">
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
              {Array.from({ length: 11 }, (_, i) =>
                (1 + i * 0.1).toFixed(1),
              ).map((height) => (
                <SelectItem key={height} value={height}>
                  {height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs" htmlFor="marginH">
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
              {Array.from({ length: 9 }, (_, i) => 10 + i * 5).map((margin) => (
                <SelectItem key={margin} value={margin.toString()}>
                  {margin}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs" htmlFor="marginV">
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
              {Array.from({ length: 9 }, (_, i) => 10 + i * 5).map((margin) => (
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
          Reset
        </Button>
      </div>
    </div>
  );
}
