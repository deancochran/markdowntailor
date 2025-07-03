import { ResumeStyles } from "@/lib/utils/styles";

// A list of good, readable fonts for resumes
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open+Sans", label: "Open Sans" },
  { value: "Source+Sans+Pro", label: "Source Sans Pro" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times+New+Roman", label: "Times New Roman" },
];

interface StyleControlsProps {
  styles: ResumeStyles;
  onChange: (styles: ResumeStyles) => void;
}

export default function StyleControls({
  styles,
  onChange,
}: StyleControlsProps) {
  const handleChange = (key: keyof ResumeStyles, value: string | number) => {
    onChange({
      ...styles,
      [key]: value,
    });
  };

  return (
    <div className="p-4 border rounded-md bg-white">
      <h2 className="text-lg font-semibold mb-4">Style Settings</h2>

      <div className="space-y-4">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium mb-1">Font</label>
          <select
            value={styles.fontFamily}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="w-full p-2 border rounded"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Font Size: {styles.fontSize}px
          </label>
          <input
            type="range"
            min="9"
            max="16"
            step="0.5"
            value={styles.fontSize}
            onChange={(e) =>
              handleChange("fontSize", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Line Height: {styles.lineHeight}
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.05"
            value={styles.lineHeight}
            onChange={(e) =>
              handleChange("lineHeight", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Margins */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Horizontal Margin: {styles.marginH}px
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={styles.marginH}
            onChange={(e) => handleChange("marginH", parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vertical Margin: {styles.marginV}px
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={styles.marginV}
            onChange={(e) => handleChange("marginV", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
