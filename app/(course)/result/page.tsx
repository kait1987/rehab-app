import { Suspense } from 'react';
import ResultContent from './ResultContent';

export const metadata = {
  title: '코스 결과',
};

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultContent />
    </Suspense>
  );
}

function ResultSkeleton() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">결과 로딩 중...</div>
    </div>
  );
}

