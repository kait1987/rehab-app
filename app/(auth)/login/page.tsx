import { Suspense } from 'react';
import LoginContent from './LoginContent';

// Server Component - 강제 CSR 없음
export default function LoginPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginContent />
    </Suspense>
  );
}

