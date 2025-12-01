// Kakao Map utility functions

export function loadKakaoMapScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // API 키 유효성 검사
    if (!apiKey || apiKey.trim() === '') {
      reject(new Error('Kakao Map API 키가 비어있습니다. 환경 변수를 확인하세요.'))
      return
    }

    // 이미 로드되어 있고 maps 객체도 있으면 즉시 resolve
    if (window.kakao && window.kakao.maps) {
      // console.log('Kakao Map 이미 로드됨')
      resolve()
      return
    }

    const scriptId = 'kakao-map-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement

    if (existingScript) {
      // console.log('기존 스크립트 발견, 로드 대기 중...')
      
      // 스크립트가 이미 있지만 아직 로드되지 않은 경우
      let checkCount = 0
      const maxChecks = 50 // 5초 (100ms * 50)
      
      const checkInterval = setInterval(() => {
        checkCount++
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval)
          // console.log('기존 스크립트 로드 완료')
          resolve()
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval)
          // 타임아웃이지만 스크립트는 있으므로, 혹시 로드 실패했을 수 있음
          // 기존 스크립트 제거하고 새로 시도하는 로직은 위험할 수 있으므로 에러 반환
          reject(new Error('Kakao Map 스크립트 로드 시간 초과 (기존 스크립트)'))
        }
      }, 100)
      return
    }

    // 새 스크립트 생성
    // console.log('새 Kakao Map 스크립트 로드 시작...')
    const script = document.createElement('script')
    script.id = scriptId
    // autoload=false 필수: 스크립트 로드 후 maps.load()를 명시적으로 호출하기 위함
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer,drawing`
    script.async = true
    
    // 타임아웃 설정 (10초)
    const timeoutId = setTimeout(() => {
      // 타임아웃 시 스크립트 제거하지 않음 (네트워크가 느린 경우일 수 있음)
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      reject(new Error(
        `Kakao Map 스크립트 로드 타임아웃. ` +
        `도메인(${currentDomain})이 카카오 개발자 콘솔에 등록되어 있는지 확인하세요.`
      ))
    }, 10000)

    script.onload = () => {
      clearTimeout(timeoutId)
      // console.log('Kakao Map 스크립트 로드 완료')
      
      // window.kakao 객체 확인
      if (window.kakao) {
        // maps 객체가 바로 없을 수 있음 (autoload=false이므로)
        // 하지만 sdk.js가 로드되면 window.kakao.maps는 존재해야 함 (초기화는 안 되었더라도)
        resolve()
      } else {
        reject(new Error('Kakao Map 스크립트 로드되었으나 window.kakao 객체 없음'))
      }
    }

    script.onerror = (event) => {
      clearTimeout(timeoutId)
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      console.error('Kakao Map 스크립트 로드 에러:', event)
      
      // 스크립트 로드 실패 시 DOM에서 제거하여 재시도 가능하게 함
      script.remove()
      
      reject(new Error(
        `Kakao Map 스크립트 로드 실패. ` +
        `도메인(${currentDomain}) 등록 및 API 키(${apiKey.substring(0, 5)}...) 확인 필요.`
      ))
    }

    document.head.appendChild(script)
  })
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

// Geocoding API: Convert address to coordinates (using Kakao Map JavaScript API)
export function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number; address: string } | null> {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject(new Error('Kakao Map API is not loaded'))
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()
    
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const firstResult = result[0]
        resolve({
          latitude: parseFloat(firstResult.y),
          longitude: parseFloat(firstResult.x),
          address: firstResult.address_name,
        })
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve(null)
      } else {
        reject(new Error('Address search failed'))
      }
    })
  })
}

// Reverse Geocoding API: Convert coordinates to address (using Kakao Map JavaScript API)
export function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject(new Error('Kakao Map API is not loaded'))
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()
    
    geocoder.coord2Address(longitude, latitude, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const firstResult = result[0]
        resolve(firstResult.address.address_name)
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve(null)
      } else {
        reject(new Error('Coordinate search failed'))
      }
    })
  })
}

