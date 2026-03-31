import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AdminGuard() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || user.role !== 'admin') {
        navigate('/', { replace: true });
      }
      setChecking(false);
    }).catch(() => {
      base44.auth.redirectToLogin('/admin');
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}