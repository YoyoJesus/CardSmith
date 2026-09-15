import { $typst } from "@myriaddreamin/typst.ts";

let initPromise: Promise<void> | null = null;
let initError: Error | null = null;
let initialized = false;

export async function initCompiler(): Promise<void> {
  if (initialized) return;
  if (initError) throw initError;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      $typst.setCompilerInitOptions({
        getModule: () =>
          fetch("/typst_ts_web_compiler_bg.wasm").then((r) => r.arrayBuffer()),
      });
      $typst.setRendererInitOptions({
        getModule: () =>
          fetch("/typst_ts_renderer_bg.wasm").then((r) => r.arrayBuffer()),
      });
      await $typst.pdf({ mainContent: "" });
      initialized = true;
    } catch (err) {
      initError = err instanceof Error ? err : new Error(String(err));
      initPromise = null;
      throw initError;
    }
  })();

  return initPromise;
}

export async function compileToPdf(typstCode: string): Promise<Uint8Array> {
  await initCompiler();
  const pdfData = await $typst.pdf({ mainContent: typstCode });
  if (!pdfData) throw new Error("PDF compilation returned no data");
  return pdfData;
}

export async function compileToSvg(typstCode: string): Promise<string> {
  await initCompiler();
  return await $typst.svg({ mainContent: typstCode });
}

export function downloadPdf(
  pdfData: Uint8Array,
  filename = "business-card.pdf",
): void {
  const blob = new Blob([pdfData.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
