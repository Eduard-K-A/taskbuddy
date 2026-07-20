import { beforeEach, describe, expect, it } from "vitest";
import { clearStoredSession, getStoredSession, setStoredSession } from "./session";

describe("session storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredSession()).toBeNull();
  });

  it("round-trips a stored session", () => {
    setStoredSession({
      accessToken: "tok-123",
      adminProfile: { name: "admin@taskbuddy.io", email: "admin@taskbuddy.io" },
    });
    expect(getStoredSession()).toEqual({
      accessToken: "tok-123",
      adminProfile: { name: "admin@taskbuddy.io", email: "admin@taskbuddy.io" },
    });
  });

  it("clears the stored session", () => {
    setStoredSession({ accessToken: "tok", adminProfile: { name: "a", email: "a" } });
    clearStoredSession();
    expect(getStoredSession()).toBeNull();
  });

  it("returns null instead of throwing on corrupted storage", () => {
    localStorage.setItem("tb-admin-session", "{not-json");
    expect(getStoredSession()).toBeNull();
  });
});
