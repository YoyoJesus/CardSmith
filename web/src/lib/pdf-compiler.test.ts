import { beforeEach, describe, expect, it, vi } from "vitest";

const typstMock = vi.hoisted(() => ({
  compilerOptions: undefined as
    undefined | { getModule: () => Promise<ArrayBuffer> },
  rendererOptions: undefined as
    undefined | { getModule: () => Promise<ArrayBuffer> },
  pdf: vi.fn(),
  svg: vi.fn(),
  setCompilerInitOptions: vi.fn(),
  setRendererInitOptions: vi.fn(),
}));

vi.mock("@myriaddreamin/typst.ts", () => ({
  $typst: {
    pdf: typstMock.pdf,
    svg: typstMock.svg,
    setCompilerInitOptions: typstMock.setCompilerInitOptions,
    setRendererInitOptions: typstMock.setRendererInitOptions,
  },
}));

describe("initCompiler", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    typstMock.compilerOptions = undefined;
    typstMock.rendererOptions = undefined;
    typstMock.setCompilerInitOptions.mockImplementation((options) => {
      typstMock.compilerOptions = options;
    });
    typstMock.setRendererInitOptions.mockImplementation((options) => {
      typstMock.rendererOptions = options;
    });
    typstMock.pdf.mockImplementation(async () => {
      await typstMock.compilerOptions?.getModule();
      return new Uint8Array();
    });
    typstMock.svg.mockImplementation(async () => {
      await typstMock.rendererOptions?.getModule();
      return "<svg />";
    });
  });

  it("reports a clear HTTP error when a WASM response is not successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(null, { status: 404, statusText: "Not Found" }),
        ),
    );
    const { initCompiler } = await import("./pdf-compiler");

    await expect(initCompiler()).rejects.toThrow(
      "Failed to load /typst_ts_web_compiler_bg.wasm: HTTP 404 Not Found",
    );
  });

  it("checks renderer WASM responses before parsing them", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(new ArrayBuffer(1)))
        .mockResolvedValueOnce(
          new Response(null, { status: 503, statusText: "Unavailable" }),
        ),
    );
    const { initCompiler } = await import("./pdf-compiler");

    await expect(initCompiler()).rejects.toThrow(
      "Failed to load /typst_ts_renderer_bg.wasm: HTTP 503 Unavailable",
    );
  });

  it("retries initialization after a transient failure", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockImplementation(() =>
        Promise.resolve(new Response(new ArrayBuffer(1))),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { initCompiler } = await import("./pdf-compiler");

    await expect(initCompiler()).rejects.toThrow("network down");
    await expect(initCompiler()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
