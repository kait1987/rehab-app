// Kakao Map utility functions

export function loadKakaoMapScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]')
    if (existingScript) {
      // Wait for existing script to load
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error('Failed to load Kakao Map script: timeout'))
        }
      }, 10000)
      return
    }

    if (!apiKey) {
      reject(new Error('Kakao Map API key is required'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true
    
    script.onload = () => {
      if (window.kakao && window.kakao.load) {
        window.kakao.load(() => {
          if (window.kakao && window.kakao.maps) {
            resolve()
          } else {
            reject(new Error('Failed to initialize Kakao Map'))
          }
        })
      } else {
        reject(new Error('Kakao Map SDK loaded but initialization failed'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Kakao Map script: network error'))
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

