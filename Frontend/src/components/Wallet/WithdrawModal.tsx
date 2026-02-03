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

export function WithdrawModal({ open, onClose, currentBalance, onSuccess }: Props) {
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

    const close = () => {
        reset();
        onClose();
    };

    const validate = () => {
        const cardDigits = onlyDigits(cardNumber);
        if (cardDigits.length !== 16) return "شماره کارت باید ۱۶ رقم باشد.";
        if (!ownerName.trim()) return "نام و نام خانوادگی را وارد کنید.";

        const amt = validateAmount(amount);
        if (!amt.ok) return amt.error!;
        if (amt.amount! > (currentBalance ?? 0)) return "موجودی کافی نیست.";

        return null;
    };

    const submit = async () => {
        setError(null);

        const v = validate();
        if (v) return setError(v);

        const amt = Number(onlyDigits(amount));

        try {
            setSubmitting(true);
            await withdrawFromWallet(amt);
            onSuccess?.();
            close();
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                "خطا در برداشت. لطفاً دوباره تلاش کنید.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={close}
            title="برداشت به کارت بانکی"
            subtitle="مبلغ از کیف پول کسر و به کارت مقصد منتقل می‌شود."
            footer={
                <>
                    <Button className={modalBtnGhost} onClick={close} disabled={submitting}>
                        انصراف
                    </Button>
                    <Button className={modalBtnPrimary} onClick={submit} disabled={submitting}>
                        {submitting ? "در حال انجام..." : "تأیید برداشت"}
                    </Button>
                </>
            }

            size="md"
        >
            <div className="space-y-4 1000">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">موجودی فعلی</span>
                        <span className="font-semibold text-gray-900">{balanceFa} تومان</span>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor="w-card" className="block pb-2">
                            شماره کارت
                        </Label>
                        <Input
                            id="w-card"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            disabled={submitting}
                            style={{ textAlign: 'center' }}
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <Label htmlFor="w-owner" className="block pb-2">
                            نام و نام خانوادگی صاحب کارت
                        </Label>
                        <Input
                            id="w-owner"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            placeholder="مثال: علی رضایی"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="w-amount" className="block pb-2">
                            مبلغ برداشت (تومان)
                        </Label>
                        <Input
                            id="w-amount"
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
