describe("globals", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("resolves a valid APP_ENV", async () => {
    process.env.APP_ENV = "stg";
    const { globals } = await import("./globals");
    expect(globals.appEnv).toBe("stg");
  });

  it("falls back to defaults for optional values", async () => {
    process.env.APP_ENV = "local";
    delete process.env.API_BASE_URL;
    delete process.env.SESSION_SECRET;
    const { globals } = await import("./globals");
    expect(globals.apiBaseUrl).toBe("http://localhost:8000");
    expect(globals.sessionSecret).toBe("");
  });

  it("throws for an invalid APP_ENV", async () => {
    process.env.APP_ENV = "production";
    await expect(import("./globals")).rejects.toThrow(/APP_ENV must be one of/);
  });

  it("throws when APP_ENV is missing", async () => {
    delete process.env.APP_ENV;
    await expect(import("./globals")).rejects.toThrow(/APP_ENV must be one of/);
  });
});
