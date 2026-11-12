"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QrScanner from "qr-scanner";
import { useTranslations } from "next-intl";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Avatar,
  Alert,
  Button,
  Card,
  FileButton,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCamera,
  IconCameraOff,
  IconInfoCircle,
  IconQrcode,
  IconSearch,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  useOwnerCheckIn,
  useOwnerManualCheckIn,
  useOwnerReservations,
} from "@/features/owner/hooks/use-owner-reservations";
import { GuestContextBadges } from "@/features/owner/reservations";
import {
  canOwnerReservationCheckIn,
  matchesOwnerReservationSearch,
} from "@/features/owner/selectors/owner-reservation-selectors";
import { OwnerShell } from "@/features/owner/shared";
import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";
import { cameraErrorIssue, cameraSupportIssue, requestCameraStream, type CameraIssue } from "../camera";

type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "checking"
  | "reading-photo"
  | "photo-error"
  | "found"
  | "not-found"
  | "unavailable";

function ReservationLookupCard({
  reservation,
  onCheckIn,
  checkInPending = false,
}: {
  reservation: OwnerReservation;
  onCheckIn?: () => void;
  checkInPending?: boolean;
}) {
  const t = useTranslations("OwnerCheckIn");
  const canCheckIn = canOwnerReservationCheckIn(reservation);
  const isConfirmed =
    reservation.reservationStatus === ReservationStatus.Confirmed;
  const hasCheckedIn = reservation.visitStatus !== VisitStatus.Expected;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: uiColors.surface,
        border: `1px solid ${uiColors.border}`,
      }}
    >
      <Group wrap="nowrap">
        <Avatar color="warmCoral" radius="xl">
          {reservation.initials}
        </Avatar>
        <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
          <GuestContextBadges
            tier={reservation.tier}
            preOrder={reservation.preOrder}
          />
          <Text fw={750}>{reservation.guestName}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {t("reservationMeta", {
              time: reservation.time,
              count: reservation.partySize,
              reference: reservation.reference,
            })}
          </Text>
          {hasCheckedIn ? (
            <Text size="xs" c={uiColors.statusSuccessText} fw={700}>
              {t("alreadyCheckedIn")}
            </Text>
          ) : null}
        </Stack>
        {canCheckIn ? (
          <Button
            size="sm"
            radius="md"
            leftSection={<IconUserCheck size={16} />}
            loading={checkInPending}
            disabled={!onCheckIn}
            onClick={onCheckIn}
          >
            {t("checkIn")}
          </Button>
        ) : (
          <Link
            href={
              isConfirmed
                ? `/owner/reservations/${reservation.id}/arrival`
                : `/owner/reservations/${reservation.id}`
            }
            style={{ textDecoration: "none" }}
          >
            <Button size="sm" radius="md">
              {isConfirmed ? t("view") : t("review")}
            </Button>
          </Link>
        )}
      </Group>
    </Card>
  );
}

function OwnerCheckInContent() {
  const t = useTranslations("OwnerCheckIn");
  const searchParams = useSearchParams();
  const { reservations: ownerReservations } = useOwnerReservations();
  const checkIn = useOwnerCheckIn();
  const manualCheckIn = useOwnerManualCheckIn();
  const [mode, setMode] = useState("manual");
  const [query, setQuery] = useState("");
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>("idle");
  const [cameraIssue, setCameraIssue] = useState<CameraIssue | null>(null);
  const [cameraSession, setCameraSession] = useState(0);
  const [scannedReservation, setScannedReservation] =
    useState<OwnerReservation | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraAttemptRef = useRef(0);
  const resetPhotoRef = useRef<() => void>(null);
  const linkedReservation = ownerReservations.find(
    (reservation) => reservation.id === searchParams.get("reservation"),
  );
  const qrReservation =
    scannedReservation ??
    (scannerStatus !== "not-found" ? linkedReservation : undefined);
  const manualResults = query.trim()
    ? ownerReservations.filter((reservation) =>
        matchesOwnerReservationSearch(reservation, query),
      )
    : linkedReservation
      ? [linkedReservation]
      : [];

  const stopCamera = useCallback(() => {
    cameraAttemptRef.current += 1;
    scannerRef.current?.destroy();
    scannerRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const checkInQr = (data: string) => {
    stopCamera();
    const attempt = cameraAttemptRef.current;
    setScannerStatus("checking");
    checkIn.mutate(data, {
      onSuccess: (reservation) => {
        if (cameraAttemptRef.current !== attempt) return;
        setScannedReservation(reservation);
        setScannerStatus("found");
      },
      onError: () => {
        if (cameraAttemptRef.current === attempt) setScannerStatus("not-found");
      },
    });
  };

  const startCamera = async () => {
    stopCamera();
    setScannedReservation(null);
    const issue = cameraSupportIssue(window.isSecureContext, Boolean(navigator.mediaDevices?.getUserMedia));
    setCameraIssue(issue);
    if (issue) {
      setScannerStatus("unavailable");
      return;
    }

    const attempt = cameraAttemptRef.current;
    const isCurrent = () => cameraAttemptRef.current === attempt;
    setScannerStatus("starting");
    // A fresh video element keeps the previous scanner's delayed cleanup away from a new stream.
    setCameraSession(attempt);

    try {
      const stream = await requestCameraStream(navigator.mediaDevices, isCurrent);
      if (!stream) return;
      streamRef.current = stream;
      // Let React mount/show the video before qr-scanner checks Safari playback visibility.
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (!isCurrent()) return;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      const scanner = new QrScanner(
        video,
        ({ data }) => {
          if (scannerRef.current !== scanner) return;

          checkInQr(data);
        },
        {
          preferredCamera: "environment",
          maxScansPerSecond: 10,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        },
      );
      scannerRef.current = scanner;

      await scanner.start();
      if (scannerRef.current === scanner) setScannerStatus("scanning");
    } catch (error) {
      if (!isCurrent()) return;
      stopCamera();
      setCameraIssue(cameraErrorIssue(error));
      setScannerStatus("unavailable");
    }
  };

  const scanPhoto = async (file: File) => {
    stopCamera();
    const attempt = cameraAttemptRef.current;
    setScannedReservation(null);
    setCameraIssue(null);
    setScannerStatus("reading-photo");
    try {
      const { data } = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      if (cameraAttemptRef.current === attempt) checkInQr(data);
    } catch {
      if (cameraAttemptRef.current === attempt) setScannerStatus("photo-error");
    }
  };

  const changeMode = (nextMode: string) => {
    stopCamera();
    setScannerStatus("idle");
    setCameraIssue(null);
    setScannedReservation(null);
    setMode(nextMode);
  };

  return (
    <OwnerShell title={t("title")} eyebrow={t("eyebrow")}>
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={changeMode}
          color="warmCoral"
          data={[
            { value: "qr", label: t("modes.qr") },
            { value: "manual", label: t("modes.manual") },
          ]}
        />

        {mode === "qr" ? (
          <>
            <Card
              radius="lg"
              p="md"
              style={{
                minHeight: 240,
                background: uiColors.brandPrimarySoft,
                border: `1px dashed ${uiColors.brandPrimary}`,
              }}
            >
              <Stack align="center" justify="center" gap="sm" h="100%">
                <video
                  key={cameraSession}
                  ref={videoRef}
                  muted
                  playsInline
                  aria-label={t("cameraLabel")}
                  style={{
                    display:
                      scannerStatus === "starting" ||
                      scannerStatus === "scanning"
                        ? "block"
                        : "none",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    borderRadius: 12,
                    background: "black",
                  }}
                />

                {scannerStatus !== "starting" &&
                scannerStatus !== "scanning" ? (
                  <ThemeIcon
                    size={58}
                    radius="md"
                    color={
                      scannerStatus === "unavailable"
                        ? "gray"
                        : "warmCoral"
                    }
                  >
                    {scannerStatus === "unavailable" ? (
                      <IconCameraOff size={30} />
                    ) : (
                      <IconQrcode size={30} />
                    )}
                  </ThemeIcon>
                ) : null}

                <Text
                  size="sm"
                  ta="center"
                  c={uiColors.textSecondary}
                  aria-live="polite"
                >
                  {scannerStatus === "unavailable" && cameraIssue
                    ? t(`cameraIssues.${cameraIssue}`)
                    : t(`scanner.${scannerStatus}`)}
                </Text>

                {scannerStatus === "scanning" ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      stopCamera();
                      setScannerStatus("idle");
                    }}
                  >
                    {t("stopCamera")}
                  </Button>
                ) : (
                  <Group justify="center">
                    <Button
                      leftSection={<IconCamera size={18} />}
                      loading={
                        scannerStatus === "starting" ||
                        scannerStatus === "reading-photo" ||
                        scannerStatus === "checking"
                      }
                      onClick={startCamera}
                    >
                      {scannerStatus === "idle"
                        ? t("openCamera")
                        : t("scanAgain")}
                    </Button>
                    {scannerStatus === "not-found" ||
                    scannerStatus === "photo-error" ||
                    scannerStatus === "unavailable" ? (
                      <Button
                        variant="default"
                        onClick={() => changeMode("manual")}
                      >
                        {t("modes.manual")}
                      </Button>
                    ) : null}
                  </Group>
                )}

                <FileButton accept="image/*" capture="environment" resetRef={resetPhotoRef}
                  disabled={scannerStatus === "checking" || scannerStatus === "reading-photo"}
                  onChange={file => {
                    if (file) void scanPhoto(file);
                    resetPhotoRef.current?.();
                  }}>
                  {props => <Button {...props} variant="subtle" leftSection={<IconQrcode size={18} />}
                    disabled={scannerStatus === "checking" || scannerStatus === "reading-photo"}>
                    {t("scanPhoto")}
                  </Button>}
                </FileButton>
              </Stack>
            </Card>

            {qrReservation ? (
              <ReservationLookupCard reservation={qrReservation} />
            ) : null}
          </>
        ) : (
          <>
            <TextInput
              size="md"
              radius="md"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              leftSection={<IconSearch size={18} />}
            />

            {manualResults.length > 0 ? (
              <Stack gap="sm">
                {manualResults.map((reservation) => (
                  <ReservationLookupCard
                    key={reservation.id}
                    reservation={reservation}
                    onCheckIn={
                      canOwnerReservationCheckIn(reservation)
                        ? () => manualCheckIn.mutate(reservation.id)
                        : undefined
                    }
                    checkInPending={
                      manualCheckIn.isPending &&
                      manualCheckIn.variables === reservation.id
                    }
                  />
                ))}
                {manualCheckIn.isError ? (
                  <Alert color="red">{t("manualError")}</Alert>
                ) : null}
              </Stack>
            ) : (
              <Card radius="lg" p="xl" withBorder>
                <Stack align="center" gap="xs">
                  <IconSearch size={28} color={uiColors.textSecondary} />
                  <Text fw={700} ta="center">
                    {query.trim()
                      ? t("noMatch")
                      : t("searchTitle")}
                  </Text>
                  <Text size="sm" ta="center" c={uiColors.textSecondary}>
                    {t("searchHelp")}
                  </Text>
                </Stack>
              </Card>
            )}
          </>
        )}

        <Group gap={6} align="flex-start" wrap="nowrap">
          <IconInfoCircle
            size={16}
            color={uiColors.textSecondary}
            style={{ marginTop: 2 }}
          />
          <Text size="xs" c={uiColors.textSecondary}>
            {t("guidance")}
          </Text>
        </Group>
      </Stack>
    </OwnerShell>
  );
}

export function OwnerCheckInScreen() {
  const t = useTranslations("OwnerCheckIn");

  return (
    <Suspense
      fallback={
        <OwnerShell title={t("title")} eyebrow={t("loadingEyebrow")}>
          <Text c={uiColors.textSecondary}>{t("loading")}</Text>
        </OwnerShell>
      }
    >
      <OwnerCheckInContent />
    </Suspense>
  );
}
