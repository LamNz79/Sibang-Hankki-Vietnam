import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useOwnerWalkIn } from "@/features/owner/hooks/use-owner-reservations";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

type OwnerWalkInModalProps = {
  opened: boolean;
  onClose: () => void;
};

function errorMessageKey(error: Error | null) {
  if (error instanceof ApiError && error.status === 409) {
    return "capacityError";
  }
  return "genericError";
}

export function OwnerWalkInModal({
  opened,
  onClose,
}: OwnerWalkInModalProps) {
  const t = useTranslations("OwnerDashboard.walkIn");
  const mutation = useOwnerWalkIn();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [partySize, setPartySize] = useState<number | string>(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const mutationErrorKey = errorMessageKey(mutation.error);

  const close = () => {
    if (mutation.isPending) return;
    mutation.reset();
    setNameError(null);
    setPhoneError(null);
    onClose();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = customerName.trim();
    const phone = customerPhone.trim();
    setNameError(name ? null : t("nameRequired"));
    setPhoneError(phone ? null : t("phoneRequired"));
    if (!name || !phone || typeof partySize !== "number" || partySize < 1) return;

    try {
      await mutation.mutateAsync({
        customerName: name,
        customerPhone: phone,
        partySize,
        specialRequest: specialRequest.trim() || undefined,
      });
      notifications.show({ color: "teal", message: t("added") });
      setCustomerName("");
      setCustomerPhone("");
      setPartySize(2);
      setSpecialRequest("");
      onClose();
    } catch {
      // The mutation error is rendered in the modal.
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Text fw={800}>{t("title")}</Text>}
      centered
      radius="lg"
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
    >
      <form onSubmit={submit}>
        <Stack gap="md">
          <Text size="sm" c={uiColors.textSecondary}>
            {t("description")}
          </Text>
          {mutation.isError ? (
            <Alert color="red" title={t("errorTitle")}>
              {t(mutationErrorKey)}
            </Alert>
          ) : null}
          <TextInput
            label={t("name")}
            placeholder={t("namePlaceholder")}
            required
            maxLength={120}
            value={customerName}
            error={nameError}
            onChange={(event) => {
              setCustomerName(event.currentTarget.value);
              setNameError(null);
            }}
          />
          <TextInput
            label={t("phone")}
            placeholder={t("phonePlaceholder")}
            required
            maxLength={30}
            value={customerPhone}
            error={phoneError}
            onChange={(event) => {
              setCustomerPhone(event.currentTarget.value);
              setPhoneError(null);
            }}
          />
          <NumberInput
            label={t("partySize")}
            min={1}
            required
            value={partySize}
            onChange={setPartySize}
          />
          <Textarea
            label={t("notes")}
            placeholder={t("notesPlaceholder")}
            value={specialRequest}
            onChange={(event) => setSpecialRequest(event.currentTarget.value)}
          />
          <Group grow>
            <Button variant="default" onClick={close} disabled={mutation.isPending}>
              {t("cancel")}
            </Button>
            <Button type="submit" loading={mutation.isPending}>{t("submit")}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
