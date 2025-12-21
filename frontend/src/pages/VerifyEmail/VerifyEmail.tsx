import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const hasVerified = useRef(false);

  useEffect(() => {
    const handleVerification = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      console.log('Verifying token:', token);
      if (!token) {
        alert('لینک تایید نامعتبر است.');
        navigate('/login');
        return;
      }

      try {
        await verifyEmail(token);
        alert('حساب کاربری با موفقیت فعال شد!');
        navigate('/profile/edit');
      } catch (error: any) {
        console.error('Verification error:', error);
        const errorMessage = error.response?.data?.message || 'تایید ناموفق بود. لینک ممکن است منقضی یا نامعتبر باشد.';
        alert(errorMessage);
        navigate('/login');
      }
    };

    handleVerification();
  }, [token, navigate, verifyEmail]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Verifying your email...</p>
    </div>
  );
};

export default VerifyEmail;
