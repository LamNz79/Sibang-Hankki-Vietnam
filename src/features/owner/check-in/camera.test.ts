import { describe, expect, it, vi } from "vitest";
import { cameraErrorIssue, cameraSupportIssue, requestCameraStream } from "./camera";

describe("mobile check-in camera", () => {
  it("distinguishes HTTP from an unsupported in-app browser", () => {
    expect(cameraSupportIssue(false, false)).toBe("insecure");
    expect(cameraSupportIssue(true, false)).toBe("unsupported");
    expect(cameraSupportIssue(true, true)).toBeNull();
  });

  it.each([
    ["NotAllowedError", "denied"], ["SecurityError", "denied"],
    ["NotFoundError", "missing"], ["NotReadableError", "busy"], ["AbortError", "busy"],
  ])("explains %s without losing its cause", (name, issue) => {
    expect(cameraErrorIssue(new DOMException("Camera error", name))).toBe(issue);
  });

  it("handles unknown scanner errors", () => {
    expect(cameraErrorIssue("Camera not found.")).toBe("unavailable");
    expect(cameraErrorIssue(null)).toBe("unavailable");
  });

  it("requests camera synchronously and keeps the original permission rejection", async () => {
    const error = new DOMException("Permission denied", "NotAllowedError");
    const getUserMedia = vi.fn().mockRejectedValue(error);
    const result = requestCameraStream({ getUserMedia }, () => true);
    expect(getUserMedia).toHaveBeenCalledExactlyOnceWith({ audio: false, video: { facingMode: { ideal: "environment" } } });
    await expect(result).rejects.toBe(error);
  });

  it("stops a stream granted after changing modes or leaving the screen", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    let resolve!: (value: MediaStream) => void;
    const pending = new Promise<MediaStream>(accept => { resolve = accept; });
    let current = true;
    const result = requestCameraStream({ getUserMedia: vi.fn(() => pending) }, () => current);
    current = false;
    resolve(stream);
    expect(await result).toBeNull();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("returns the granted stream for the current scan", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    expect(await requestCameraStream({ getUserMedia: vi.fn().mockResolvedValue(stream) }, () => true)).toBe(stream);
    expect(stop).not.toHaveBeenCalled();
  });
});
