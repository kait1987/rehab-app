// Kakao Map API type definitions
declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    getCenter(): LatLng
    getLevel(): number
    relayout(): void
    setBounds(bounds: LatLngBounds): void
  }

  interface MapOptions {
    center: LatLng
    level: number
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    setPosition(position: LatLng): void
    getPosition(): LatLng
  }

  interface MarkerOptions {
    position: LatLng
    map?: Map
    title?: string
    clickable?: boolean
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions)
    open(map: Map, marker: Marker): void
    close(): void
    setContent(content: string | HTMLElement): void
  }

  interface InfoWindowOptions {
    content: string | HTMLElement
    removable?: boolean
  }

  class LatLngBounds {
    extend(latlng: LatLng): void
  }

  namespace event {
    function addListener(target: any, type: string, handler: () => void): void
  }

  namespace services {
    class Geocoder {
      addressSearch(address: string, callback: (result: any[], status: Status) => void): void
      coord2Address(lng: number, lat: number, callback: (result: any[], status: Status) => void): void
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR'
    }
  }
}

declare global {
  interface Window {
    kakao: {
      maps: typeof kakao.maps
      load: (callback: () => void) => void
    }
  }
}

export {}

