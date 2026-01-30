import { Card, CardContent } from '../components/UILib';
import { Button } from '../components/UILib';
import { ArrowLeft, ArrowDownToLine, History, Plus, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWalletData } from '../services/paymentService';
import { useEffect, useState } from 'react';
import { WithdrawModal } from "../components/Wallet/WithdrawModal";
import { DepositModal } from "../components/Wallet/DepositModal";
import { SuccessToast } from "../components/Wallet/SuccessToast";


export function WalletPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [credit, setCredit] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const fetchCredit = async () => {
    setLoading(true);
    try {
      const data = await getWalletData();
      if (typeof data?.balance === "number") setCredit(data.balance);
      else setCredit(Number(data?.balance ?? 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredit();

    const st: any = location.state;
    if (st?.walletUpdated) fetchCredit();

    if (st?.toast) {
      showToast(st.toast);
	  setToastOpen(false);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8 flex-row-reverse">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="rounded-xl hover:bg-cyan-50"
            style={{ color: '#4FCBE9' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 style={{ color: '#16519F' }}>کیف پول</h1>
        </div>

        {/* Balance Card */}
        <Card
          className="mb-8 border-0 rounded-2xl shadow-lg bg-gray-50"
          style={{ background: 'linear-gradient(135deg, #16519F 0%, #4FCBE9 100%)' }}
        >
          <CardContent className="p-8 md:p-10 text-white">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <p className="text-blue-50">موجودی فعلی</p>
              <Wallet className="w-5 h-5" />
            </div>

            <div className="flex items-baseline gap-2 justify-end" dir="ltr">
              <span className="text-2xl md:text-3xl">تومان</span>
              <span className="text-5xl md:text-6xl">
                {loading ? "..." : credit.toLocaleString("fa-IR")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all rounded-2xl bg-gray-50 border-0 shadow-md"
            onClick={() => setWithdrawOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F07E7420' }}
              >
                <ArrowDownToLine className="w-7 h-7" style={{ color: '#F07E74' }} />
              </div>
              <h3 className="mb-2">برداشت</h3>
              <p className="text-gray-500">انتقال وجه به حساب بانکی</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all rounded-2xl bg-gray-50 border-0 shadow-md"
            onClick={() => navigate("/profile/transactions")}
          >
            <CardContent className="p-6 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#16519F20' }}
              >
                <History className="w-7 h-7" style={{ color: '#16519F' }} />
              </div>
              <h3 className="mb-2">تاریخچه تراکنش‌ها</h3>
              <p className="text-gray-500">مشاهده همه تراکنش‌های شما</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all bg-gray-50 rounded-2xl border-0 shadow-md"
            onClick={() => setDepositOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#4FCBE920' }}
              >
                <Plus className="w-7 h-7" style={{ color: '#4FCBE9' }} />
              </div>
              <h3 className="mb-2">شارژ حساب</h3>
              <p className="text-gray-500">افزودن وجه به کیف پول</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        currentBalance={credit}
        onSuccess={() => {
          fetchCredit();
          showToast("برداشت با موفقیت انجام شد.");
        }}
      />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
      />

      <SuccessToast
        open={toastOpen}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
