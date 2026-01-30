export type CardForm = {
  cardNumber: string; // 16 digits
  expMonth: string;   // "01".."12"
  expYear: string;    // "1405" or "2026" (you decide; here we just validate length)
  cvv2: string;       // 3-4 digits
  fullName: string;
};

export function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  const d = onlyDigits(value).slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

export function validateCard(form: CardForm): string | null {
  const card = onlyDigits(form.cardNumber);
  if (card.length !== 16) return "شماره کارت باید ۱۶ رقم باشد.";
  const mm = onlyDigits(form.expMonth);
  if (mm.length < 1 || mm.length > 2) return "ماه انقضا معتبر نیست.";
  const monthNum = Number(mm);
  if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) return "ماه انقضا معتبر نیست.";
  const yy = onlyDigits(form.expYear);
  if (yy.length < 2) return "سال انقضا معتبر نیست.";
  const cvv = onlyDigits(form.cvv2);
  if (cvv.length < 3 || cvv.length > 4) return "CVV2 باید ۳ یا ۴ رقم باشد.";
  if (!form.fullName.trim()) return "نام و نام خانوادگی را وارد کنید.";
  return null;
}

export function validateAmount(amountStr: string, min = 1000): { ok: boolean; amount?: number; error?: string } {
  const digits = onlyDigits(amountStr);
  if (!digits) return { ok: false, error: "مبلغ را وارد کنید." };
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "مبلغ معتبر نیست." };
  if (amount < min) return { ok: false, error: `حداقل مبلغ ${min.toLocaleString("fa-IR")} تومان است.` };
  return { ok: true, amount };
}
