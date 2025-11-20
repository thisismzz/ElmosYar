import { Card, CardContent } from '../components/UILib';
import { Button } from '../components/UILib';
import { ArrowLeft, ArrowDownToLine, History, Plus, Wallet } from 'lucide-react';

interface WalletPageProps {
  onNavigate: (page: 'profile' | 'wallet' | 'edit-profile') => void;
}

export function WalletPage({ onNavigate }: WalletPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onNavigate('profile')}
            className="rounded-xl hover:bg-cyan-50"
            style={{ color: '#4FCBE9' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 style={{ color: '#16519F' }}>Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-0 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #16519F 0%, #4FCBE9 100%)' }}>
          <CardContent className="p-8 md:p-10 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <p className="text-blue-50">Current Balance</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl">$1,247</span>
              <span className="text-2xl md:text-3xl">.50</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F07E7420' }}
              >
                <ArrowDownToLine className="w-7 h-7" style={{ color: '#F07E74' }} />
              </div>
              <h3 className="mb-2">Withdraw</h3>
              <p className="text-gray-500">Transfer funds to your bank</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#16519F20' }}
              >
                <History className="w-7 h-7" style={{ color: '#16519F' }} />
              </div>
              <h3 className="mb-2">Transaction History</h3>
              <p className="text-gray-500">View all your transactions</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all rounded-2xl border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#4FCBE920' }}
              >
                <Plus className="w-7 h-7" style={{ color: '#4FCBE9' }} />
              </div>
              <h3 className="mb-2">Top-up</h3>
              <p className="text-gray-500">Add funds to your wallet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}