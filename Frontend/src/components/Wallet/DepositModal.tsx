import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

import { Modal, modalBtnGhost, modalBtnPrimary } from "./Modal";
import { Button, Input, Label } from "../UILib";
import { onlyDigits, validateAmount } from "./cardUtils";

type GatewayId = "mockpay";

type Gateway = {
  id: GatewayId;
  name: string;
  icon: React.ReactNode;
  description?: string;
};

const GATEWAYS: Gateway[] = [
  {
    id: "mockpay",
    name: "باقر پی (BagherPay)",
    icon: <CreditCard className="h-4 w-4" />,
    description: "امن و مطمئن",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DepositModal({ open, onClose }: Props) {
  const navigate = useNavigate();

  const presets = useMemo(
    () => [50_000, 100_000, 200_000, 500_000, 1_000_000],
    []
  );

  const [amount, setAmount] = useState("");
  const [gatewayId, setGatewayId] = useState<GatewayId>("mockpay");
  const [error, setError] = useState<string | null>(null);

  const selectedGateway = useMemo(
    () => GATEWAYS.find((g) => g.id === gatewayId)!,
    [gatewayId]
  );

  const reset = () => {
    setAmount("");
    setGatewayId("mockpay");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    setError(null);

    const result = validateAmount(amount);
    if (!result.ok) {
      setError(result.error!);
      return;
    }

    navigate("/wallet/add-balance-gateway", {
      state: {
        amount: result.amount,
        gateway: {
          id: selectedGateway.id,
          name: selectedGateway.name,
        },
      },
    });

    handleClose();
  };

  const handlePresetClick = (value: number) => {
    setAmount(String(value));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="شارژ کیف پول"
      subtitle="مبلغ و درگاه پرداخت را انتخاب کنید."
      size="md"
      footer={
        <>
          <Button className={modalBtnGhost} onClick={handleClose}>
            انصراف
          </Button>
          <Button className={modalBtnPrimary} onClick={handleConfirm}>
            ادامه
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Error */}
        {error && (
          <div
            className="rounded-xl border p-3 text-sm"
            style={{
              backgroundColor: "var(--error-bg)",
              borderColor: "var(--error-border)",
              color: "var(--error-text)",
            }}
          >
            {error}
          </div>
        )}

        {/* Amount */}
        <div>
          <Label htmlFor="deposit-amount" className="block pb-2">
            مبلغ شارژ (تومان)
          </Label>

          <Input
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--background-light)",
              border: "1px solid var(--border-color)",
              textAlign: "center"
            }}
            id="deposit-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(onlyDigits(e.target.value))}
            placeholder="مثال: 100000"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => {
              const isActive = onlyDigits(amount) === String(preset);

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="rounded-full px-3 py-1.5 text-sm border transition"
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary-color)"
                      : "var(--background)",
                    borderColor: isActive
                      ? "var(--primary-color)"
                      : "var(--border-color)",
                    color: isActive
                      ? "#fff"
                      : "var(--text-primary)",
                  }}
                >
                  {preset.toLocaleString("fa-IR")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gateway */}
        <div>
          <Label htmlFor="deposit-gateway" className="block pb-2">
            درگاه پرداخت
          </Label>

          <select
            id="deposit-gateway"
            value={gatewayId}
            onChange={(e) => setGatewayId(e.target.value as GatewayId)}
            className="w-full rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {GATEWAYS.map((gateway) => (
              <option key={gateway.id} value={gateway.id}>
                {gateway.name}
              </option>
            ))}
          </select>

          <div
            className="mt-3 flex items-start gap-2 rounded-xl p-3 text-sm"
            style={{
              backgroundColor: "var(--background-light)",
              border: "1px solid var(--border-color)",
              color: "var(--text-light)",
            }}
          >
            <span style={{ color: "var(--primary-color)" }}>
              {selectedGateway.icon}
            </span>

            <div>
              <div
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedGateway.name}
              </div>
              {selectedGateway.description && (
                <div>{selectedGateway.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
