import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Input, Label } from "../components/UILib";
import { depositToWallet, verifyPayment } from "../services/paymentService";
import { formatCardNumber, onlyDigits, validateCard } from "../components/Wallet/cardUtils";
import { CreditCard, ShieldCheck } from "lucide-react";

type GatewayState = {
    amount: number;
    gateway: { id: string; name: string };
};

type CardForm = {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv2: string;
    fullName: string;
};

function makeCaptchaToken() {
    // simple mock captcha token
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

export function WalletGatewayPage() {
    const { gatewayType } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as any | null;

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<CardForm>({
        cardNumber: "",
        expMonth: "",
        expYear: "",
        cvv2: "",
        fullName: "",
    });

    const [otp, setOtp] = useState("");
    const [captchaToken, setCaptchaToken] = useState(() => makeCaptchaToken());
    const [captchaValue, setCaptchaValue] = useState("");

    const amountFa = useMemo(
        () => (state?.amount ?? 0).toLocaleString("fa-IR"),
        [state?.amount]
    );

    useEffect(() => { console.log(location.state) })

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
                <Card className="max-w-lg w-full rounded-2xl border-0 shadow-lg bg-white">
                    <CardContent className="p-6 space-y-3">
                        <h1 className="text-lg font-semibold text-gray-900">درگاه پرداخت</h1>
                        <p className="text-sm text-gray-600">
                            اطلاعات پرداخت یافت نشد. لطفاً از صفحه کیف پول مجدداً اقدام کنید.
                        </p>
                        <div className="flex justify-end">
                            <Button onClick={() => navigate(gatewayType == "add-balance-gateway" ? "/profile/wallet" : "/topic/food")} className="rounded-xl">
                                بازگشت
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const validate = () => {
        setError(null);

        const cardErr = validateCard(form);
        if (cardErr) return cardErr;

        const otpDigits = onlyDigits(otp);
        if (otpDigits.length < 4) return "کد تأیید را به‌درستی وارد کنید.";

        if (captchaValue.trim().toUpperCase() !== captchaToken) {
            return "کپچا صحیح نیست.";
        }
        return null;
    };

    const pay = async () => {
        const v = validate();
        if (v) return setError(v);

        if (state.auth) {
            try {
                setSubmitting(true);

                const result = await verifyPayment(state.auth);
                console.log("vef", result);
                navigate("/profile/wallet", {
                    replace: true,
                    state: { walletUpdated: true, toast: result.message }
                });

            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ||
                    e?.message ||
                    "پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.";
                setError(msg);
            } finally {
                setSubmitting(false);
            }
        }
        else {
            try {
                setSubmitting(true);

                await depositToWallet(state.amount); //!

                navigate("/profile/wallet", {
                    replace: true,
                    state: { walletUpdated: true, toast: "واریز موفق انجام شد." }
                });

            } catch (e: any) {
                const msg =
                    e?.response?.data?.message ||
                    e?.message ||
                    "پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.";
                setError(msg);
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen pb-20 lg:pb-8" dir="rtl">
            <div className="max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-12">
                <Card className="rounded-3xl border-0 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.45)] overflow-hidden bg-white">
                    {/* Header shell */}
                    <div
                        className="px-6 py-6"
                        style={{
                            background:
                                "radial-gradient(900px 420px at 95% 0%, rgba(79,203,233,0.35) 0%, rgba(22,89,159,1) 45%, rgba(13,55,110,1) 100%)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h1 className="text-white text-lg md:text-xl font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    {state.gateway?.name ?? "درگاه پرداخت"}
                                </h1>
                                <p className="mt-1 text-white/75 text-sm">
                                    پرداخت امن (نمادین) برای شارژ کیف پول
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                                onClick={() => navigate(-1)}
                                disabled={submitting}
                            >
                                بازگشت
                            </Button>
                        </div>

                        <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 p-4 text-white flex items-center justify-between">
                            <div className="text-sm opacity-90">مبلغ پرداخت</div>
                            <div className="text-lg font-semibold">{amountFa} تومان</div>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-5">
                        {error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        {/* Card form */}
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                <ShieldCheck className="w-5 h-5 text-[#16599f]" />
                                اطلاعات کارت
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label className="block pb-2 " htmlFor="p-card">
                                        شماره کارت
                                    </Label>
                                    <div className="flex justify-center">

                                        <Input
                                            id="p-card"
                                            inputMode="numeric"
                                            value={form.cardNumber}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))
                                            }
                                            dir="ltr"
                                            placeholder="1234 5678 9012 3456"
                                            disabled={submitting}
                                            style={{ textAlign: 'center' }}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="block pb-2" htmlFor="p-name">
                                        نام و نام خانوادگی صاحب کارت
                                    </Label>
                                    <Input
                                        id="p-name"
                                        value={form.fullName}
                                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                                        placeholder="مثال: علی رضایی"
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <Label className="block pb-2" htmlFor="p-mm">
                                        ماه انقضا
                                    </Label>
                                    <Input
                                        id="p-mm"
                                        inputMode="numeric"
                                        value={form.expMonth}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, expMonth: onlyDigits(e.target.value).slice(0, 2) }))
                                        }
                                        placeholder="مثال: 06"
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <Label className="block pb-2" htmlFor="p-yy">
                                        سال انقضا
                                    </Label>
                                    <Input
                                        id="p-yy"
                                        inputMode="numeric"
                                        value={form.expYear}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, expYear: onlyDigits(e.target.value).slice(0, 4) }))
                                        }
                                        placeholder="مثال: 1406"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="block pb-2" htmlFor="p-cvv">
                                        CVV2
                                    </Label>
                                    <Input
                                        id="p-cvv"
                                        inputMode="numeric"
                                        value={form.cvv2}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, cvv2: onlyDigits(e.target.value).slice(0, 4) }))
                                        }
                                        placeholder="۳ یا ۴ رقم"
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* OTP + Captcha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                <Label className="block pb-2" htmlFor="p-otp">
                                    کد تأیید پیامک‌شده
                                </Label>
                                <Input
                                    id="p-otp"
                                    inputMode="numeric"
                                    value={otp}
                                    onChange={(e) => setOtp(onlyDigits(e.target.value).slice(0, 8))}
                                    placeholder="مثال: 123456"
                                    disabled={submitting}
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    در حالت واقعی، این کد برای شما ارسال می‌شود (این صفحه فقط تست است).
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="block pb-2" htmlFor="p-captcha">
                                        کپچا
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCaptchaToken(makeCaptchaToken());
                                            setCaptchaValue("");
                                        }}
                                        className="text-xs text-[#16599f] hover:text-[#0f4f90] transition"
                                        disabled={submitting}
                                    >
                                        تغییر کپچا
                                    </button>
                                </div>

                                <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-lg tracking-widest text-gray-700 select-none">
                                    {captchaToken}
                                </div>

                                <Input
                                    id="p-captcha"
                                    value={captchaValue}
                                    onChange={(e) => setCaptchaValue(e.target.value)}
                                    placeholder="کد بالا را وارد کنید"
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div
                            className="rounded-2xl p-4 flex items-center justify-end gap-2"
                            style={{
                                background:
                                    "linear-gradient(90deg, rgba(22,89,159,0.08) 0%, rgba(79,203,233,0.10) 100%)",
                            }}
                        >
                            <Button
                                className="rounded-xl px-4 py-2 bg-white hover:bg-gray-50 text-[#16599f] border border-[#16599f]/25 hover:border-[#16599f]/40 transition active:scale-[0.98]"
                                onClick={() => navigate("/profile/wallet")}
                                disabled={submitting}
                            >
                                انصراف
                            </Button>

                            <Button
                                className="rounded-xl px-4 py-2 text-white bg-[#16599f] hover:bg-[#0f4f90] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition active:translate-y-0 active:scale-[0.98]"
                                onClick={pay}
                                disabled={submitting}
                            >
                                {submitting ? "در حال پرداخت..." : "پرداخت"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
