import {
  RenderOptions,
  RenderResult,
  render as rtlRender,
} from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function to handle React 19 compatibility
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  const container = document.createElement("div");
  document.body.appendChild(container);

  // Create customized RTL render function
  const customizedRender = (
    element: ReactElement,
    renderOptions?: RenderOptions,
  ) => {
    return rtlRender(element, {
      container,
      ...renderOptions,
    });
  };

  const result = customizedRender(ui, options);

  return {
    ...result,
    // Add a cleanup method to remove the div from the DOM
    unmount: () => {
      result.unmount();
      document.body.removeChild(container);
    },
  };
}

// Re-export everything from RTL
export * from "@testing-library/react";

// Override the render method
export { render };
