'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  latitude?: number;
  longitude?: number;
  markerTitle?: string;
  onMarkerClick?: () => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({
  latitude = 37.5665,
  longitude = 126.978,
  markerTitle = '위치',
  onMarkerClick,
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Kakao Map API 동적 로드
    const loadKakaoMap = () => {
      // 이미 로드되었는지 확인
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Kakao Map API 로드 완료');
        setIsLoaded(true);
        setError(null);
        initMap();
      };

      script.onerror = () => {
        console.error('❌ Kakao Map API 로드 실패');
        setError('지도 API를 불러올 수 없습니다. API Key를 확인하세요.');
        setIsLoaded(false);
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current) return;

      try {
        if (!window.kakao || !window.kakao.maps) {
          throw new Error('Kakao Maps API가 로드되지 않았습니다');
        }

        const options = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapRef.current = map;

        // ✅ 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          title: markerTitle,
          clickable: !!onMarkerClick,
        });

        marker.setMap(map);

        // 마커 클릭 이벤트
        if (onMarkerClick) {
          window.kakao.maps.event.addListener(marker, 'click', onMarkerClick);
        }

        console.log('✅ Kakao Map 초기화 완료');
      } catch (err) {
        console.error('❌ 지도 초기화 오류:', err);
        setError('지도를 초기화할 수 없습니다.');
      }
    };

    loadKakaoMap();
  }, [latitude, longitude, markerTitle, onMarkerClick]);

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm mt-2">
            API Key: {process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ? '설정됨' : '미설정'}
          </p>
        </div>
      )}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          backgroundColor: '#f0f0f0',
        }}
        className="border border-gray-200"
      />
      {!isLoaded && !error && (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
          <p className="text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
}
