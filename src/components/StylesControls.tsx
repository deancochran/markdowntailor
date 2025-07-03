
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ResumeStyles, SYSTEM_FONTS, defaultStyles } from '@/lib/utils/styles';

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

export default function StylesControls({ styles, onStylesChange }: StylesControlsProps) {
  const handleStyleChange = (key: keyof ResumeStyles, value: string | number) => {
    onStylesChange({
      ...styles,
      [key]: value,
    });
  };

  return (
    <div className="p-4 space-y-4 bg-background border-b">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Font Family */}
        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select
            value={styles.fontFamily}
            onValueChange={(value) => handleStyleChange('fontFamily', value)}
          >
            <SelectTrigger id="fontFamily">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{
                    fontFamily: SYSTEM_FONTS.includes(font)
                      ? font.replace(/\+/g, ' ')
                      : `"${font.replace(/\+/g, ' ')}", sans-serif`
                  }}>
                    {font.replace(/\+/g, ' ')}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="fontSize">Font Size ({styles.fontSize}px)</Label>
          </div>
          <Slider
            id="fontSize"
            min={8}
            max={16}
            step={0.5}
            value={[styles.fontSize]}
            onValueChange={([value]) => handleStyleChange('fontSize', value)}
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="lineHeight">Line Height ({styles.lineHeight})</Label>
          </div>
          <Slider
            id="lineHeight"
            min={1}
            max={2}
            step={0.1}
            value={[styles.lineHeight]}
            onValueChange={([value]) => handleStyleChange('lineHeight', value)}
          />
        </div>

        {/* Margins */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="marginH">Horizontal Margin ({styles.marginH}px)</Label>
            </div>
            <Slider
              id="marginH"
              min={10}
              max={50}
              step={5}
              value={[styles.marginH]}
              onValueChange={([value]) => handleStyleChange('marginH', value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="marginV">Vertical Margin ({styles.marginV}px)</Label>
            </div>
            <Slider
              id="marginV"
              min={10}
              max={50}
              step={5}
              value={[styles.marginV]}
              onValueChange={([value]) => handleStyleChange('marginV', value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onStylesChange(defaultStyles)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
