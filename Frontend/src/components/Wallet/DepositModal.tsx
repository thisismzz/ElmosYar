import React, { useMemo, useState } from "react";
import { Modal, modalBtnGhost, modalBtnPrimary } from "./Modal";
import { Button, Input, Label } from "../UILib";
import { onlyDigits, validateAmount } from "./cardUtils";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

type GatewayId = "mockpay";

type Gateway = {
  id: GatewayId;
  name: string;
  icon: React.ReactNode;
  description?: string;
};

const gateways: Gateway[] = [
  {
    id: "mockpay",
    name: "باقر پی (BagherPay)",
    icon: <CreditCard className="w-4 h-4" />,
    description: "امن و مطمعن",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DepositModal({ open, onClose }: Props) {
  const navigate = useNavigate();

  const presets = useMemo(() => [50000, 100000, 200000, 500000, 1000000], []);
  const [amount, setAmount] = useState<string>("");
  const [gatewayId, setGatewayId] = useState<GatewayId>("mockpay");

  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount("");
    setGatewayId("mockpay");
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const confirm = () => {
    setError(null);

    const amt = validateAmount(amount);
    if (!amt.ok) return setError(amt.error!);

    // navigate to mock payment page; pass non-sensitive state only
    const g = gateways.find((x) => x.id === gatewayId)!;

    navigate("/wallet/gateway", {
      state: {
        amount: amt.amount,
        gateway: { id: g.id, name: g.name },
      },
    });

    close();
  };

  const pickPreset = (v: number) => setAmount(String(v));

  return (
    <Modal
      open={open}
      onClose={close}
      title="شارژ کیف پول"
      subtitle="مبلغ و درگاه پرداخت را انتخاب کنید."
      footer={
        <>
          <Button className={modalBtnGhost} onClick={close}>
            انصراف
          </Button>
          <Button className={modalBtnPrimary} onClick={confirm}>
            ادامه
          </Button>
        </>
      }
      size="md"
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <Label htmlFor="d-amount" className="block pb-2">
            مبلغ شارژ (تومان)
          </Label>
          <Input
            id="d-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(onlyDigits(e.target.value))}
            placeholder="مثال: 100000"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((p) => {
              const active = onlyDigits(amount) === String(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickPreset(p)}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm border transition",
                    "shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0",
                    active
                      ? "bg-[#16599f] text-white border-[#16599f]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#16599f]/40",
                  ].join(" ")}
                >
                  {p.toLocaleString("fa-IR")}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="d-gateway" className="block pb-2">
            درگاه پرداخت
          </Label>

          {/* Simple select; icons are shown next to label above (and in the gateway page). */}
          <div className="relative">
            <select
              id="d-gateway"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value as GatewayId)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#16599f]/30"
            >
              {gateways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 flex items-start gap-2">
            <span className="mt-0.5 text-[#16599f]">
              {gateways.find((x) => x.id === gatewayId)?.icon}
            </span>
            <div>
              <div className="font-medium text-gray-900">
                {gateways.find((x) => x.id === gatewayId)?.name}
              </div>
              <div className="text-gray-600">
                {gateways.find((x) => x.id === gatewayId)?.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
