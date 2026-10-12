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
import { useState, type FormEvent } from "react";
import { useOwnerWalkIn } from "@/features/owner/hooks/use-owner-reservations";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

type OwnerWalkInModalProps = {
  opened: boolean;
  onClose: () => void;
};

function errorMessage(error: Error | null) {
  if (error instanceof ApiError && error.status === 409) {
    const message =
      error.body && typeof error.body === "object" && "message" in error.body
        ? (error.body as { message?: unknown }).message
        : null;
    return typeof message === "string"
      ? message
      : "There is not enough capacity in the current service slot.";
  }
  return "The walk-in could not be added. Please try again.";
}

export function OwnerWalkInModal({
  opened,
  onClose,
}: OwnerWalkInModalProps) {
  const mutation = useOwnerWalkIn();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [partySize, setPartySize] = useState<number | string>(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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
    setNameError(name ? null : "Guest name is required.");
    setPhoneError(phone ? null : "Phone number is required.");
    if (!name || !phone || typeof partySize !== "number" || partySize < 1) return;

    try {
      await mutation.mutateAsync({
        customerName: name,
        customerPhone: phone,
        partySize,
        specialRequest: specialRequest.trim() || undefined,
      });
      notifications.show({ color: "teal", message: "Walk-in guest added." });
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
      title={<Text fw={800}>Add walk-in</Text>}
      centered
      radius="lg"
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
    >
      <form onSubmit={submit}>
        <Stack gap="md">
          <Text size="sm" c={uiColors.textSecondary}>
          Add a guest who has arrived without an online reservation. Capacity
          is taken from the current service slot.
          </Text>
          {mutation.isError ? (
            <Alert color="red" title="Unable to add walk-in">
              {errorMessage(mutation.error)}
            </Alert>
          ) : null}
          <TextInput
            label="Guest name"
            placeholder="Enter guest name"
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
            label="Phone"
            placeholder="Enter phone number"
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
            label="Party size"
            min={1}
            required
            value={partySize}
            onChange={setPartySize}
          />
          <Textarea
            label="Notes"
            placeholder="Seating or allergy notes"
            value={specialRequest}
            onChange={(event) => setSpecialRequest(event.currentTarget.value)}
          />
          <Group grow>
            <Button variant="default" onClick={close} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>Add guest</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
