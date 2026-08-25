"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QrScanner from "qr-scanner";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Avatar,
  Button,
  Card,
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
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { GuestContextBadges } from "@/features/owner/reservations";
import {
  findOwnerReservationByCheckInToken,
  matchesOwnerReservationSearch,
} from "@/features/owner/selectors/owner-reservation-selectors";
import { OwnerShell } from "@/features/owner/shared";
import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "found"
  | "not-found"
  | "unavailable";

const scannerMessages: Record<ScannerStatus, string> = {
  idle: "Open the rear camera and point it at the guest's QR code.",
  starting: "Starting camera...",
  scanning: "Hold the QR code inside the camera view.",
  found: "Reservation found. Review it before checking in the guest.",
  "not-found": "This QR code does not match a reservation at this restaurant.",
  unavailable:
    "The camera could not be opened. Check camera permission or use manual lookup.",
};

function ReservationLookupCard({
  reservation,
}: {
  reservation: OwnerReservation;
}) {
  const canCheckIn =
    reservation.reservationStatus === ReservationStatus.Confirmed &&
    reservation.visitStatus === VisitStatus.Expected;
  const isConfirmed =
    reservation.reservationStatus === ReservationStatus.Confirmed;

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
            {reservation.time} · {reservation.partySize} guests · Ref. {" "}
            {reservation.reference}
          </Text>
        </Stack>
        <Link
          href={
            isConfirmed
              ? `/owner/reservations/${reservation.id}/arrival`
              : `/owner/reservations/${reservation.id}`
          }
          style={{ textDecoration: "none" }}
        >
          <Button
            size="sm"
            radius="md"
            leftSection={canCheckIn ? <IconUserCheck size={16} /> : undefined}
          >
            {canCheckIn ? "Check in" : isConfirmed ? "View" : "Review"}
          </Button>
        </Link>
      </Group>
    </Card>
  );
}

function OwnerCheckInContent() {
  const searchParams = useSearchParams();
  const ownerReservations = useOwnerReservations();
  const [mode, setMode] = useState("qr");
  const [query, setQuery] = useState("");
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>("idle");
  const [qrReservationId, setQrReservationId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const linkedReservation = ownerReservations.find(
    (reservation) => reservation.id === searchParams.get("reservation"),
  );
  const qrReservation =
    ownerReservations.find(
      (reservation) => reservation.id === qrReservationId,
    ) ?? (scannerStatus !== "not-found" ? linkedReservation : undefined);
  const manualResults = query.trim()
    ? ownerReservations.filter((reservation) =>
        matchesOwnerReservationSearch(reservation, query),
      )
    : linkedReservation
      ? [linkedReservation]
      : [];

  const stopCamera = useCallback(() => {
    scannerRef.current?.destroy();
    scannerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async () => {
    stopCamera();
    setQrReservationId(null);

    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) {
      setScannerStatus("unavailable");
      return;
    }

    setScannerStatus("starting");

    const scanner = new QrScanner(
      video,
      ({ data }) => {
        if (scannerRef.current !== scanner) return;

        const reservation = findOwnerReservationByCheckInToken(
          ownerReservations,
          data,
        );
        stopCamera();
        setQrReservationId(reservation?.id ?? null);
        setScannerStatus(reservation ? "found" : "not-found");
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

    try {
      await scanner.start();
      if (scannerRef.current === scanner) setScannerStatus("scanning");
    } catch {
      if (scannerRef.current !== scanner) return;
      stopCamera();
      setScannerStatus("unavailable");
    }
  };

  const changeMode = (nextMode: string) => {
    stopCamera();
    setScannerStatus("idle");
    setQrReservationId(null);
    setMode(nextMode);
  };

  return (
    <OwnerShell title="Guest check-in" eyebrow="QR or manual lookup">
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={changeMode}
          color="warmCoral"
          data={[
            { value: "qr", label: "Scan QR" },
            { value: "manual", label: "Manual lookup" },
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
                  ref={videoRef}
                  muted
                  playsInline
                  aria-label="Reservation QR scanner camera"
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
                  {scannerMessages[scannerStatus]}
                </Text>

                {scannerStatus === "scanning" ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      stopCamera();
                      setScannerStatus("idle");
                    }}
                  >
                    Stop camera
                  </Button>
                ) : (
                  <Group justify="center">
                    <Button
                      leftSection={<IconCamera size={18} />}
                      loading={scannerStatus === "starting"}
                      onClick={startCamera}
                    >
                      {scannerStatus === "idle" ? "Open camera" : "Scan again"}
                    </Button>
                    {scannerStatus === "not-found" ||
                    scannerStatus === "unavailable" ? (
                      <Button
                        variant="default"
                        onClick={() => changeMode("manual")}
                      >
                        Manual lookup
                      </Button>
                    ) : null}
                  </Group>
                )}
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
              placeholder="Reservation no., guest name, or phone"
              aria-label="Search by reservation number, guest name, or phone"
              leftSection={<IconSearch size={18} />}
            />

            {manualResults.length > 0 ? (
              <Stack gap="sm">
                {manualResults.map((reservation) => (
                  <ReservationLookupCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </Stack>
            ) : (
              <Card radius="lg" p="xl" withBorder>
                <Stack align="center" gap="xs">
                  <IconSearch size={28} color={uiColors.textSecondary} />
                  <Text fw={700} ta="center">
                    {query.trim()
                      ? "No matching reservation found"
                      : "Search for a reservation"}
                  </Text>
                  <Text size="sm" ta="center" c={uiColors.textSecondary}>
                    Enter a booking reference, guest name, or phone number.
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
            Confirm the reservation details before checking in the guest.
            Camera access requires a supported browser and a secure connection.
          </Text>
        </Group>
      </Stack>
    </OwnerShell>
  );
}

export function OwnerCheckInScreen() {
  return (
    <Suspense
      fallback={
        <OwnerShell title="Guest check-in" eyebrow="Loading reservation...">
          <Text c={uiColors.textSecondary}>Loading check-in details...</Text>
        </OwnerShell>
      }
    >
      <OwnerCheckInContent />
    </Suspense>
  );
}
