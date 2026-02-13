import React, { useMemo, useState } from "react";
import { Modal, modalBtnGhost, modalBtnPrimary } from "./Modal";
import { Button, Input, Label } from "../UILib";
import { formatCardNumber, onlyDigits, validateAmount } from "./cardUtils";
import { withdrawFromWallet } from "../../services/paymentService";

type Props = {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
};

export function WithdrawModal({
  open,
  onClose,
  currentBalance,
  onSuccess,
}: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [amount, setAmount] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const balanceFa = useMemo(
    () => (currentBalance ?? 0).toLocaleString("fa-IR"),
    [currentBalance]
  );

  const reset = () => {
    setCardNumber("");
    setOwnerName("");
    setAmount("");
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const cardDigits = onlyDigits(cardNumber);
    if (cardDigits.length !== 16) {
      return "شماره کارت باید ۱۶ رقم باشد.";
    }

    if (!ownerName.trim()) {
      return "نام و نام خانوادگی را وارد کنید.";
    }

    const amt = validateAmount(amount);
    if (!amt.ok) return amt.error!;

    if (amt.amount! > (currentBalance ?? 0)) {
      return "موجودی کافی نیست.";
    }

    return null;
  };

  const submit = async () => {
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await withdrawFromWallet(Number(onlyDigits(amount)));
      onSuccess?.();
      handleClose();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "خطا در برداشت. لطفاً دوباره تلاش کنید.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="برداشت به کارت بانکی"
      subtitle="مبلغ از کیف پول کسر و به کارت مقصد منتقل می‌شود."
      size="md"
      footer={
        <>
          <Button
            className={modalBtnGhost}
            onClick={handleClose}
            disabled={submitting}
          >
            انصراف
          </Button>
          <Button
            className={modalBtnPrimary}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "در حال انجام..." : "تأیید برداشت"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Balance */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--background-light)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-light)" }}>
              موجودی فعلی
            </span>
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {balanceFa} تومان
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{
              backgroundColor: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "var(--error-text)",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="withdraw-card" className="block pb-2">
              شماره کارت
            </Label>
            <Input
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--background-light)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
              id="withdraw-card"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(formatCardNumber(e.target.value))
              }
              placeholder="1234 5678 9012 3456"
              disabled={submitting}
              dir="ltr"
              
            />
          </div>

          <div>
            <Label htmlFor="withdraw-owner" className="block pb-2">
              نام و نام خانوادگی صاحب کارت
            </Label>
            <Input
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--background-light)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
              id="withdraw-owner"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="مثال: علی رضایی"
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="withdraw-amount" className="block pb-2">
              مبلغ برداشت (تومان)
            </Label>
            <Input
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--background-light)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
              id="withdraw-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(onlyDigits(e.target.value))}
              placeholder="مثال: 50000"
              disabled={submitting}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
