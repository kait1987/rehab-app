// Kakao Map utility functions

export function loadKakaoMapScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // API 키 유효성 검사
    if (!apiKey || apiKey.trim() === '') {
      reject(new Error('Kakao Map API 키가 비어있습니다. 환경 변수를 확인하세요.'))
      return
    }

    // 이미 로드되어 있으면 즉시 resolve
    if (window.kakao && window.kakao.maps) {
      console.log('Kakao Map 이미 로드됨')
      resolve()
      return
    }

    const scriptId = 'kakao-map-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement

    if (existingScript) {
      console.log('기존 스크립트 발견, 로드 대기 중...')
      
      // 스크립트가 이미 있지만 아직 로드되지 않은 경우
      let checkCount = 0
      const maxChecks = 100 // 10초 (100ms * 100)
      
      const checkInterval = setInterval(() => {
        checkCount++
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval)
          console.log('기존 스크립트 로드 완료')
          resolve()
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval)
          // 스크립트가 있지만 로드 실패한 경우, 재시도
          console.warn('기존 스크립트 로드 실패, 재시도...')
          existingScript.remove()
          // 재귀 호출로 새로 로드 시도
          loadKakaoMapScript(apiKey).then(resolve).catch(reject)
        }
      }, 100)
      return
    }

    // 새 스크립트 생성
    console.log('새 Kakao Map 스크립트 로드 시작...')
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true
    script.crossOrigin = 'anonymous'

    // 타임아웃 설정 (15초)
    const timeoutId = setTimeout(() => {
      script.remove()
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      reject(new Error(
        `Kakao Map 스크립트 로드 타임아웃 (15초). ` +
        `도메인(${currentDomain})이 카카오 개발자 콘솔에 등록되어 있는지 확인하세요. ` +
        `환경 변수 NEXT_PUBLIC_KAKAO_MAP_API_KEY도 확인하세요.`
      ))
    }, 15000)

    script.onload = () => {
      clearTimeout(timeoutId)
      console.log('Kakao Map 스크립트 로드 완료, 초기화 중...')
      
      // kakao 객체가 있는지 확인
      if (!window.kakao) {
        reject(new Error('Kakao Map 스크립트는 로드되었지만 window.kakao 객체를 찾을 수 없습니다.'))
        return
      }

      // maps.load() 호출
      if (window.kakao.maps && typeof window.kakao.maps.load === 'function') {
        window.kakao.maps.load(() => {
          console.log('Kakao Map 초기화 완료')
          resolve()
        })
      } else {
        // maps.load가 없는 경우 (이미 로드된 경우)
        if (window.kakao.maps) {
          console.log('Kakao Map 이미 초기화됨')
          resolve()
        } else {
          reject(new Error('Kakao Map API 초기화 실패: maps 객체를 찾을 수 없습니다.'))
        }
      }
    }

    script.onerror = (event) => {
      clearTimeout(timeoutId)
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      console.error('Kakao Map 스크립트 로드 실패:', event)
      reject(new Error(
        `Kakao Map 스크립트를 로드할 수 없습니다. ` +
        `다음을 확인하세요:\n` +
        `1. 도메인(${currentDomain})이 카카오 개발자 콘솔의 플랫폼 설정에 등록되어 있는지\n` +
        `2. 환경 변수 NEXT_PUBLIC_KAKAO_MAP_API_KEY가 올바른 JavaScript 키인지\n` +
        `3. 브라우저 콘솔의 네트워크 탭에서 스크립트 로드 오류 확인`
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

