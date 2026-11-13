export type CameraIssue = "insecure" | "unsupported" | "denied" | "missing" | "busy" | "unavailable";

export function cameraSupportIssue(secure: boolean, hasUserMedia: boolean): CameraIssue | null {
  if (!secure) return "insecure";
  if (!hasUserMedia) return "unsupported";
  return null;
}

export function cameraErrorIssue(error: unknown): CameraIssue {
  const name = error && typeof error === "object" && "name" in error ? error.name : undefined;
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "missing";
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") return "busy";
  return "unavailable";
}

export async function requestCameraStream(
  mediaDevices: Pick<MediaDevices, "getUserMedia">,
  isCurrent: () => boolean,
) {
  // Ask once, without strict device/resolution constraints that can reject before showing a prompt.
  const stream = await mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
  if (isCurrent()) return stream;
  stream.getTracks().forEach(track => track.stop());
  return null;
}
