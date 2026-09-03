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
import { checkInOwnerReservation } from "@/features/owner/data/owner-reservation-storage";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { GuestContextBadges } from "@/features/owner/reservations";
import {
  canOwnerReservationCheckIn,
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

function ReservationLookupCard({
  reservation,
}: {
  reservation: OwnerReservation;
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
            onClick={() => checkInOwnerReservation(reservation)}
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
                  {t(`scanner.${scannerStatus}`)}
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
                      loading={scannerStatus === "starting"}
                      onClick={startCamera}
                    >
                      {scannerStatus === "idle"
                        ? t("openCamera")
                        : t("scanAgain")}
                    </Button>
                    {scannerStatus === "not-found" ||
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
                  />
                ))}
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
