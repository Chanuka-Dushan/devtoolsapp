/**
 * Dynamic PDF.js loader for browser client-side rendering and text extraction.
 * Uses official Mozilla PDF.js CDN distribution to prevent bundling conflicts with Webpack/Next.js.
 */

let loadPromise: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF.js can only be loaded in the browser."));
  }

  // Already loaded on window
  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="pdf.min.js"]'
    ) as HTMLScriptElement;

    const setupWorker = (lib: any) => {
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(lib);
    };

    if (existingScript) {
      if ((window as any).pdfjsLib) {
        setupWorker((window as any).pdfjsLib);
      } else {
        existingScript.addEventListener("load", () => {
          setupWorker((window as any).pdfjsLib);
        });
        existingScript.addEventListener("error", (err) => reject(err));
      }
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;

    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        setupWorker(lib);
      } else {
        reject(new Error("pdfjsLib was not found on window after script load."));
      }
    };

    script.onerror = (err) => {
      loadPromise = null;
      reject(new Error("Failed to load PDF.js from CDN: " + err));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
