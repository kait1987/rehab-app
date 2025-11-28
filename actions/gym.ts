"use server"

import { createClient } from "@/lib/supabase/server"

export async function getNearbyGyms(
  latitude: number,
  longitude: number,
  radiusKm: number = 1,
  filters?: {
    isQuiet?: boolean
    hasRehabEquipment?: boolean
    hasParking?: boolean
    hasShower?: boolean
    hasPtCoach?: boolean
  }
) {
  const supabase = await createClient()

  // 모든 활성 헬스장 가져오기
  let query = supabase
    .from("gyms")
    .select(`
      *,
      gym_facilities (*)
    `)
    .eq("is_active", true)

  const { data: gyms, error } = await query

  if (error) {
    return { error: error.message }
  }

  if (!gyms) {
    return { success: true, data: [] }
  }

  // 거리 계산 및 필터링
  const nearbyGyms = gyms
    .map((gym) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        Number(gym.latitude),
        Number(gym.longitude)
      )
      return { ...gym, distance }
    })
    .filter((gym) => gym.distance <= radiusKm)

  // 시설 필터 적용
  let filteredGyms = nearbyGyms
  if (filters) {
    filteredGyms = nearbyGyms.filter((gym) => {
      const facilities = gym.gym_facilities?.[0]
      if (!facilities) return false

      if (filters.isQuiet && !facilities.is_quiet) return false
      if (filters.hasRehabEquipment && !facilities.has_rehab_equipment) return false
      if (filters.hasParking && !facilities.has_parking) return false
      if (filters.hasShower && !facilities.has_shower) return false
      if (filters.hasPtCoach && !facilities.has_pt_coach) return false

      return true
    })
  }

  // 거리순 정렬
  filteredGyms.sort((a, b) => a.distance - b.distance)

  return { success: true, data: filteredGyms }
}

export async function getGymById(gymId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("gyms")
    .select(`
      *,
      gym_facilities (*),
      reviews (*)
    `)
    .eq("id", gymId)
    .eq("is_active", true)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function getGymCrowdLevel(gymId: string, dayOfWeek: number, currentTime: string) {
  const supabase = await createClient()

  // 현재 시간대 계산
  const hour = parseInt(currentTime.split(":")[0])
  let timeSlot = ""
  if (hour >= 6 && hour < 9) timeSlot = "06:00-09:00"
  else if (hour >= 9 && hour < 12) timeSlot = "09:00-12:00"
  else if (hour >= 12 && hour < 18) timeSlot = "12:00-18:00"
  else if (hour >= 18 && hour < 22) timeSlot = "18:00-22:00"
  else timeSlot = "22:00-24:00"

  const { data, error } = await supabase
    .from("gym_crowd_levels")
    .select("*")
    .eq("gym_id", gymId)
    .eq("day_of_week", dayOfWeek)
    .eq("time_slot", timeSlot)
    .single()

  if (error || !data) {
    return { success: true, data: { expected_level: "보통" } } // 기본값
  }

  return { success: true, data }
}

// 거리 계산 함수 (Haversine 공식)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 지구 반지름 (km)
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

