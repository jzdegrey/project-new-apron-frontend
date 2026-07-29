describe("logger", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, APP_ENV: "local" };
    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as unknown as { window?: unknown }).window;
  });

  it("logs info messages as structured JSON at the default level", async () => {
    const { logger } = await import("./logger");
    logger.info("hello", { userId: "123" });

    expect(console.info).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((console.info as jest.Mock).mock.calls[0][0]);
    expect(payload).toMatchObject({
      level: "info",
      message: "hello",
      context: "server",
      meta: { userId: "123" },
    });
  });

  it("suppresses debug logs below the configured level", async () => {
    process.env.LOG_LEVEL = "info";
    const { logger } = await import("./logger");
    logger.debug("should not appear");
    expect(console.debug).not.toHaveBeenCalled();
  });

  it("still emits error logs when the level is raised", async () => {
    process.env.LOG_LEVEL = "error";
    const { logger } = await import("./logger");
    logger.warn("should not appear");
    logger.error("boom");

    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("falls back to info for an unrecognized LOG_LEVEL", async () => {
    process.env.LOG_LEVEL = "verbose";
    const { logger } = await import("./logger");
    logger.debug("should not appear");
    logger.info("should appear");

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledTimes(1);
  });

  it("tags log lines with the browser context when window is defined", async () => {
    (global as unknown as { window: unknown }).window = {};
    const { logger } = await import("./logger");
    logger.info("hi");

    const payload = JSON.parse((console.info as jest.Mock).mock.calls[0][0]);
    expect(payload.context).toBe("browser");
  });

  it("tags log lines with the server context when window is undefined", async () => {
    const { logger } = await import("./logger");
    logger.info("hi");

    const payload = JSON.parse((console.info as jest.Mock).mock.calls[0][0]);
    expect(payload.context).toBe("server");
  });
});
