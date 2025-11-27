// 동네 재활 헬스장 & 운동 코스 추천 서비스 타입 정의

export interface Gym {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  website?: string
  operating_hours?: {
    weekday?: string
    weekend?: string
  }
  price_range?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GymFacility {
  id: string
  gym_id: string
  has_shower: boolean
  has_parking: boolean
  has_rehab_equipment: boolean
  has_pt_coach: boolean
  is_quiet: boolean
  equipment_types: string[]
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  gym_id: string
  user_id?: string
  tags: string[]
  comment?: string
  is_admin_review: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface GymCrowdLevel {
  id: string
  gym_id: string
  day_of_week: number
  time_slot: string
  expected_level: '한산' | '보통' | '붐빔'
  created_at: string
  updated_at: string
}

export interface ExerciseTemplate {
  id: string
  name: string
  body_part: string
  pain_level?: number
  equipment_types: string[]
  experience_level?: '초보' | '중급' | '고급'
  duration_minutes: number
  description?: string
  instructions?: string
  precautions?: string
  created_at: string
}

export interface UserCourse {
  id: string
  user_id?: string
  body_part: string
  pain_level?: number
  equipment_types: string[]
  experience_level?: string
  total_duration: number
  warmup_duration: number
  main_duration: number
  cooldown_duration: number
  created_at: string
}

export interface CourseExercise {
  id: string
  course_id: string
  exercise_template_id?: string
  exercise_name: string
  section: 'warmup' | 'main' | 'cooldown'
  sets?: number
  reps?: number
  duration_seconds?: number
  rest_seconds?: number
  order_index: number
  created_at: string
}

export interface Favorite {
  id: string
  gym_id: string
  user_id: string
  created_at: string
}

// 코스 생성 질문 응답 타입
export interface CourseQuestionnaire {
  bodyPart: string // 허리, 어깨, 무릎, 목, 기타
  painLevel: number // 1-5
  equipmentTypes: string[] // 덤벨, 머신, 매트, 밴드, 짐볼
  experienceLevel: string // 거의 안 함, 주 1-2회, 주 3회 이상
  duration?: number // 60, 90, 120 (분)
}

// 생성된 코스 결과 타입
export interface GeneratedCourse {
  course: UserCourse
  exercises: CourseExercise[]
}
