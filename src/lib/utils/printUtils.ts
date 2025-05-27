// lib/resume/printUtils.ts
import { toast } from "sonner";

/**
 * Handles document printing with fallback options
 */
export function printDocument(htmlContent: string): void {
  // Create a hidden iframe for better PDF generation
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.top = "-9999px";
  document.body.appendChild(iframe);

  // Wait for iframe to load before writing to it
  iframe.onload = () => {
    try {
      // Write content to the iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.document.documentElement.innerHTML = htmlContent;

        // Delay printing slightly to ensure all styles are applied
        setTimeout(() => {
          try {
            // Print the iframe
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            toast.success("Print dialog opened successfully");

            // Clean up the iframe after printing dialog is closed
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          } catch (err) {
            console.error("Print error:", err);
            document.body.removeChild(iframe);
            toast.error("Failed to open print dialog");

            // Fallback: open in new window
            tryPrintInNewWindow(htmlContent);
          }
        }, 250);
      }
    } catch (err) {
      console.error("Error writing to iframe:", err);
      document.body.removeChild(iframe);
      toast.error("Failed to generate PDF");

      // Try fallback method
      tryPrintInNewWindow(htmlContent);
    }
  };

  // Set a basic src to trigger the onload event
  iframe.src = "about:blank";
}

/**
 * Fallback print method using a new window
 */
function tryPrintInNewWindow(htmlContent: string): void {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Try to print
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
        toast.success("Print dialog opened in new window");
      } catch (err) {
        console.error("Fallback print error:", err);
        toast.error("Failed to print document");
      }
    }, 250);
  } else {
    toast.error(
      "Unable to open print window. Please check your popup blocker settings.",
    );
  }
}
