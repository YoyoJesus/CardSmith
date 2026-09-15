import { $typst } from "@myriaddreamin/typst.ts";

let initPromise: Promise<void> | null = null;
let initialized = false;

async function fetchWasm(path: string): Promise<ArrayBuffer> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Failed to load ${path}: HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
    );
  }
  return response.arrayBuffer();
}

export async function initCompiler(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      $typst.setCompilerInitOptions({
        getModule: () => fetchWasm("/typst_ts_web_compiler_bg.wasm"),
      });
      $typst.setRendererInitOptions({
        getModule: () => fetchWasm("/typst_ts_renderer_bg.wasm"),
      });
      await $typst.pdf({ mainContent: "" });
      await $typst.svg({ mainContent: "" });
      initialized = true;
    } catch (err) {
      initPromise = null;
      throw err instanceof Error ? err : new Error(String(err));
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
