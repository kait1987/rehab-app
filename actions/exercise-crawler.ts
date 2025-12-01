"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * 운동 데이터 크롤링 및 저장
 * 주의: 실제 웹 크롤링은 robots.txt, 저작권, 이용약관을 준수해야 합니다.
 * 이 함수는 공개 API나 공개 데이터를 사용하는 것을 권장합니다.
 */

interface ExerciseData {
  name: string
  body_part: string
  pain_level: number
  equipment_types: string[]
  experience_level: string
  duration_minutes: number
  description: string
  instructions: string
  precautions: string
}

/**
 * 공개 운동 데이터 소스에서 운동 정보 가져오기
 * 실제 구현 시 공개 API나 공개 데이터셋을 사용하세요.
 */
async function fetchExerciseDataFromPublicSources(
  bodyPart: string,
  painLevel: number
): Promise<ExerciseData[]> {
  // 예시: 공개 운동 데이터베이스나 API 사용
  // 실제로는 ExerciseDB API, Open Exercise Database 등의 공개 API 사용 권장
  
  const exercises: ExerciseData[] = []
  
  // 예시 데이터 (실제로는 API 호출로 대체)
  // 여기서는 기본적인 재활운동 데이터를 반환
  const defaultExercises: Record<string, ExerciseData[]> = {
    허리: [
      { name: '고양이-소 자세 (Cat-Cow)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '척추 유연성 향상 요가', instructions: '네 발 기기 자세에서 숨을 내쉬며 등을 둥글게 말고(고양이), 들이마시며 허리를 오목하게 만듭니다(소).', precautions: '통증이 없는 범위 내에서 움직이세요.' },
      { name: '아기 자세 (Child\'s Pose)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 이완 및 휴식 요가', instructions: '무릎을 꿇고 앉아 상체를 앞으로 숙여 이마를 바닥에 댑니다. 팔은 앞으로 뻗거나 몸 옆에 둡니다.', precautions: '무릎 통증이 있으면 주의하세요.' },
      { name: '코브라 자세 (Cobra Pose)', body_part: '허리', pain_level: 2, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 신전 요가 스트레칭', instructions: '엎드린 상태에서 손으로 바닥을 밀어 상체를 일으킵니다. 치골은 바닥에 붙입니다.', precautions: '허리에 과도한 압력이 가지 않도록 주의하세요.' },
      { name: '누워서 무릎 당기기 (Knees-to-Chest)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 및 둔근 이완 스트레칭', instructions: '누운 자세에서 양 무릎을 가슴 쪽으로 당겨 안아줍니다. 허리를 바닥에 밀착시킵니다.', precautions: '목이 들리지 않도록 하세요.' },
      { name: '앉아서 몸통 비틀기 (Seated Twist)', body_part: '허리', pain_level: 1, equipment_types: ['의자'], experience_level: '초보', duration_minutes: 5, description: '척추 회전 스트레칭', instructions: '의자에 앉아 상체를 한쪽으로 천천히 비틉니다. 시선은 뒤쪽을 향합니다.', precautions: '과도하게 비틀지 마세요.' },
      { name: '이상근 스트레칭 (Piriformis Stretch)', body_part: '허리', pain_level: 2, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '엉덩이 및 허리 통증 완화', instructions: '누워서 한쪽 다리를 다른 쪽 무릎 위에 올리고(4자 다리), 아래쪽 다리를 가슴 쪽으로 당깁니다.', precautions: '골반이 틀어지지 않게 주의하세요.' },
      { name: '맥켄지 신전 운동 (McKenzie Extension)', body_part: '허리', pain_level: 2, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 디스크 완화 스트레칭', instructions: '엎드려서 팔꿈치로 상체를 지지하고 허리를 폅니다. 시선은 정면을 봅니다.', precautions: '통증이 심해지면 즉시 중단하세요.' },
      { name: '햄스트링 스트레칭 (Hamstring Stretch)', body_part: '허리', pain_level: 1, equipment_types: ['수건'], experience_level: '초보', duration_minutes: 5, description: '허벅지 뒤쪽 및 허리 이완', instructions: '누워서 수건을 발에 걸고 다리를 천천히 들어올립니다. 무릎을 최대한 폅니다.', precautions: '무릎을 억지로 펴지 마세요.' },
      { name: '골반 기울기 운동 (Pelvic Tilt)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 안정화 기초', instructions: '누워서 허리를 바닥에 밀착시켰다(후방경사) 떼는(전방경사) 동작을 반복합니다.', precautions: '호흡을 자연스럽게 유지하세요.' },
      { name: '사이드 스트레칭 (Side Bend)', body_part: '허리', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 5, description: '옆구리 및 허리 이완', instructions: '서서 한쪽 팔을 들어 반대쪽으로 상체를 기울입니다. 옆구리가 늘어나는 것을 느낍니다.', precautions: '몸이 앞으로 쏠리지 않게 주의하세요.' },
      { name: '활 자세 (Bow Pose)', body_part: '허리', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '허리 및 전신 스트레칭', instructions: '엎드려서 무릎을 접고 손으로 발목을 잡습니다. 상체와 하체를 동시에 들어올립니다.', precautions: '허리에 무리가 가면 중단하세요.' },
      { name: '메뚜기 자세 (Locust Pose)', body_part: '허리', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '등 근육 강화 및 스트레칭', instructions: '엎드려서 팔과 다리를 동시에 들어올립니다.', precautions: '목에 힘을 빼세요.' },
      { name: '다리 벌려 상체 숙이기 (Wide-Legged Forward Bend)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허리 및 햄스트링 이완', instructions: '다리를 넓게 벌리고 서서 상체를 앞으로 숙입니다.', precautions: '무릎을 살짝 굽혀도 좋습니다.' },
      { name: '스핑크스 자세 (Sphinx Pose)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '부드러운 허리 신전', instructions: '엎드려서 팔꿈치를 어깨 아래에 두고 상체를 살짝 일으킵니다.', precautions: '어깨가 귀에서 멀어지게 하세요.' },
      { name: '누워서 비틀기 (Supine Twist)', body_part: '허리', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '척추 회전 및 이완', instructions: '누워서 무릎을 가슴으로 당긴 후 한쪽으로 넘깁니다. 시선은 반대쪽을 봅니다.', precautions: '어깨가 바닥에서 뜨지 않게 하세요.' }
    ],
    어깨: [
      { name: '어깨 으쓱하기 (Shoulder Shrugs)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '승모근 이완 스트레칭', instructions: '어깨를 귀까지 올렸다가 툭 떨어뜨립니다. 긴장을 풉니다.', precautions: '천천히 진행하세요.' },
      { name: '팔 가로질러 당기기 (Cross-Body Shoulder Stretch)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '어깨 후면 스트레칭', instructions: '한 팔을 가슴 앞으로 뻗고 반대 팔로 당겨줍니다.', precautions: '몸통이 돌아가지 않게 고정하세요.' },
      { name: '등 뒤로 손 맞잡기 (Cow Face Pose Arms)', body_part: '어깨', pain_level: 2, equipment_types: ['수건'], experience_level: '중급', duration_minutes: 5, description: '어깨 관절 가동범위 향상', instructions: '등 뒤에서 양손을 맞잡거나 수건을 잡습니다. 한 팔은 위에서, 한 팔은 아래에서 보냅니다.', precautions: '통증이 있으면 수건을 길게 잡으세요.' },
      { name: '벽 짚고 가슴 열기 (Wall Chest Stretch)', body_part: '어깨', pain_level: 1, equipment_types: ['벽'], experience_level: '초보', duration_minutes: 5, description: '가슴 및 어깨 전면 스트레칭', instructions: '벽에 팔을 대고 몸을 반대쪽으로 돌려 가슴을 엽니다.', precautions: '어깨가 솟지 않게 주의하세요.' },
      { name: '목 옆으로 늘리기 (Neck Side Stretch)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '목과 어깨 라인 이완', instructions: '한 손으로 머리를 잡고 옆으로 지그시 당깁니다. 반대쪽 어깨는 내립니다.', precautions: '어깨가 따라 올라가지 않게 하세요.' },
      { name: '견갑골 모으기 (Scapular Retraction)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 5, description: '굽은 어깨 교정', instructions: '가슴을 펴고 날개뼈를 서로 닿게 하듯 모아줍니다.', precautions: '허리가 과하게 꺾이지 않게 주의하세요.' },
      { name: '팔 돌리기 (Arm Circles)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '어깨 관절 워밍업', instructions: '팔을 크게 원을 그리며 천천히 돌려줍니다.', precautions: '통증이 없는 범위에서 돌리세요.' },
      { name: '책 펼치기 스트레칭 (Open Book Stretch)', body_part: '어깨', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '흉추 및 어깨 회전 스트레칭', instructions: '옆으로 누워 양손을 포갠 후 위쪽 팔을 반대편으로 넘깁니다. 시선은 손끝을 따라갑니다.', precautions: '골반은 고정하세요.' },
      { name: '독수리 자세 팔 (Eagle Arms)', body_part: '어깨', pain_level: 2, equipment_types: ['없음'], experience_level: '중급', duration_minutes: 5, description: '견갑골 사이 이완', instructions: '팔을 앞으로 뻗어 꼬아서 손바닥을 마주 댑니다. 팔꿈치를 살짝 들어올립니다.', precautions: '어깨 통증이 있으면 껴안는 자세로 대체하세요.' },
      { name: '강아지 자세 (Puppy Pose)', body_part: '어깨', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '어깨 및 가슴 열기', instructions: '네 발 기기 자세에서 손을 앞으로 뻗으며 가슴을 바닥으로 내립니다.', precautions: '허리가 너무 꺾이지 않게 주의하세요.' },
      { name: '실 꿰기 자세 (Thread the Needle)', body_part: '어깨', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '어깨 후면 및 척추 회전', instructions: '네 발 기기 자세에서 한 팔을 반대쪽 겨드랑이 아래로 깊숙이 넣습니다.', precautions: '목에 체중이 실리지 않게 하세요.' },
      { name: '등 뒤로 깍지 끼기 (Chest Opener)', body_part: '어깨', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '가슴 및 어깨 전면 스트레칭', instructions: '등 뒤에서 깍지를 끼고 팔을 뒤로 뻗어 가슴을 엽니다.', precautions: '턱을 당기세요.' },
      { name: '벽 천사 (Wall Angels)', body_part: '어깨', pain_level: 1, equipment_types: ['벽'], experience_level: '초보', duration_minutes: 5, description: '어깨 가동성 및 자세 교정', instructions: '벽에 등을 대고 서서 팔을 \'W\'자에서 \'I\'자로 올렸다 내립니다.', precautions: '허리가 벽에서 뜨지 않게 하세요.' }
    ],
    무릎: [
      { name: '대퇴사두근 스트레칭 (Quad Stretch)', body_part: '무릎', pain_level: 1, equipment_types: ['의자'], experience_level: '초보', duration_minutes: 5, description: '허벅지 앞쪽 이완', instructions: '서서 발목을 잡고 엉덩이 쪽으로 당깁니다. 균형을 위해 의자를 잡으세요.', precautions: '허리가 꺾이지 않게 복부에 힘을 주세요.' },
      { name: '종아리 스트레칭 (Calf Stretch)', body_part: '무릎', pain_level: 1, equipment_types: ['벽'], experience_level: '초보', duration_minutes: 5, description: '종아리 근육 이완', instructions: '벽을 밀며 한쪽 다리를 뒤로 뻗어 뒤꿈치를 바닥에 붙입니다.', precautions: '뒤쪽 무릎을 곧게 펴세요.' },
      { name: '햄스트링 앉아서 늘리기 (Seated Forward Bend)', body_part: '무릎', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허벅지 뒤쪽 유연성 향상', instructions: '바닥에 앉아 다리를 펴고 상체를 앞으로 숙입니다.', precautions: '등이 굽지 않도록 주의하세요.' },
      { name: '누워서 다리 들어올리기 (Straight Leg Raise)', body_part: '무릎', pain_level: 2, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '무릎 주변 근력 강화', instructions: '누워서 한쪽 다리를 곧게 펴서 들어올립니다. 발끝을 당깁니다.', precautions: '반동을 이용하지 마세요.' },
      { name: '무릎 눌러주기 (Knee Press)', body_part: '무릎', pain_level: 1, equipment_types: ['매트', '수건'], experience_level: '초보', duration_minutes: 5, description: '무릎 관절 신전', instructions: '다리를 펴고 앉아 무릎 아래에 수건을 대고 지그시 누릅니다.', precautions: '통증이 심하면 강도를 조절하세요.' },
      { name: '내전근 스트레칭 (Butterfly Stretch)', body_part: '무릎', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '허벅지 안쪽 이완', instructions: '앉아서 발바닥을 마주 대고 무릎을 바닥 쪽으로 내립니다.', precautions: '무리하게 누르지 마세요.' },
      { name: 'IT 밴드 스트레칭 (IT Band Stretch)', body_part: '무릎', pain_level: 2, equipment_types: ['폼롤러'], experience_level: '중급', duration_minutes: 5, description: '허벅지 바깥쪽 이완', instructions: '폼롤러 위에 옆으로 누워 허벅지 바깥쪽을 문지릅니다.', precautions: '통증이 심할 수 있으니 천천히 진행하세요.' },
      { name: '비둘기 자세 (Pigeon Pose)', body_part: '무릎', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '엉덩이 및 허벅지 깊은 스트레칭', instructions: '한쪽 다리는 앞으로 접고 반대쪽 다리는 뒤로 뻗습니다. 상체를 앞으로 숙입니다.', precautions: '무릎 통증이 있으면 누워서 하는 자세로 대체하세요.' },
      { name: '개구리 자세 (Frog Pose)', body_part: '무릎', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '고관절 및 내전근 스트레칭', instructions: '네 발 기기 자세에서 무릎을 양옆으로 벌리고 팔꿈치를 바닥에 댑니다.', precautions: '무릎 안쪽에 쿠션을 대세요.' },
      { name: '런지 스트레칭 (Low Lunge)', body_part: '무릎', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '고관절 굴곡근 스트레칭', instructions: '한 발을 앞으로 내딛고 뒷무릎을 바닥에 댑니다. 골반을 앞으로 밀어줍니다.', precautions: '앞 무릎이 발끝을 넘지 않게 하세요.' },
      { name: '누워서 4자 다리 (Reclined Pigeon)', body_part: '무릎', pain_level: 1, equipment_types: ['매트'], experience_level: '초보', duration_minutes: 5, description: '엉덩이 및 무릎 이완', instructions: '누워서 한쪽 발목을 반대쪽 무릎 위에 올리고 다리를 안아줍니다.', precautions: '목에 힘을 빼세요.' },
      { name: '서서 햄스트링 스트레칭 (Standing Hamstring Stretch)', body_part: '무릎', pain_level: 1, equipment_types: ['의자'], experience_level: '초보', duration_minutes: 5, description: '허벅지 뒤쪽 이완', instructions: '의자나 벤치에 한쪽 발을 올리고 상체를 앞으로 숙입니다.', precautions: '등을 곧게 펴세요.' }
    ],
    목: [
      { name: '목 옆으로 당기기 (Neck Side Stretch)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '목 측면 근육 이완', instructions: '한 손으로 반대쪽 머리를 잡고 어깨 쪽으로 당깁니다.', precautions: '어깨는 고정하고 목만 움직이세요.' },
      { name: '목 대각선 당기기 (Levator Scapulae Stretch)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '목 후면 및 견갑거근 이완', instructions: '고개를 45도 돌려 숙이고 손으로 지그시 당깁니다. 시선은 겨드랑이를 봅니다.', precautions: '통증이 없는 범위에서 진행하세요.' },
      { name: '턱 당기기 (Chin Tucks)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '거북목 교정 운동', instructions: '턱을 목 쪽으로 수평하게 당겨 이중턱을 만듭니다. 뒷목이 길어지는 느낌을 받습니다.', precautions: '고개가 숙여지지 않게 주의하세요.' },
      { name: '목 천천히 돌리기 (Neck Rolls)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '목 관절 가동성 향상', instructions: '목을 천천히 크게 원을 그리며 돌립니다. 반대 방향으로도 돌립니다.', precautions: '어지러우면 중단하세요.' },
      { name: '가슴 펴고 고개 들기 (Neck Extension)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '목 전면 스트레칭', instructions: '양손을 쇄골에 대고 고개를 뒤로 젖힙니다. 입을 다물면 효과가 좋습니다.', precautions: '목 뒤가 찝히지 않게 주의하세요.' },
      { name: '수건으로 목 당기기 (Towel Neck Stretch)', body_part: '목', pain_level: 2, equipment_types: ['수건'], experience_level: '초보', duration_minutes: 5, description: '목 커브 회복 스트레칭', instructions: '수건을 목 뒤에 걸고 양손으로 앞으로 당기며 고개를 뒤로 젖힙니다.', precautions: '팔에 힘을 주어 목을 지지하세요.' },
      { name: '목 등척성 운동 (Neck Isometrics)', body_part: '목', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 5, description: '목 근육 강화', instructions: '손으로 이마, 뒤통수, 옆머리를 밀고 머리는 버팁니다.', precautions: '움직임 없이 힘만 줍니다.' },
      { name: '승모근 마사지 (Trapezius Massage)', body_part: '목', pain_level: 1, equipment_types: ['손'], experience_level: '초보', duration_minutes: 3, description: '어깨 뭉침 해소', instructions: '반대쪽 손으로 승모근을 주무릅니다.', precautions: '너무 세게 누르지 마세요.' }
    ],
    기타: [
      { name: '전신 기지개 (Full Body Stretch)', body_part: '기타', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '전신 근육 이완', instructions: '깍지 낀 손을 머리 위로 뻗어 온몸을 늘려줍니다. 발끝까지 폅니다.', precautions: '호흡을 참지 마세요.' },
      { name: '손목 굴곡 신전 (Wrist Stretch)', body_part: '기타', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '손목 스트레칭', instructions: '팔을 뻗어 손등과 손바닥을 번갈아 몸 쪽으로 당깁니다.', precautions: '팔꿈치를 펴고 진행하세요.' },
      { name: '발목 돌리기 (Ankle Circles)', body_part: '기타', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '발목 유연성 향상', instructions: '앉거나 서서 발목을 천천히 돌려줍니다.', precautions: '최대한 큰 원을 그리세요.' },
      { name: '다운독 자세 (Downward Dog)', body_part: '기타', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '전신 후면 스트레칭', instructions: '엎드려서 엉덩이를 높이 들어올려 \'ㅅ\'자 모양을 만듭니다.', precautions: '어깨와 손목에 무리가 가지 않게 하세요.' },
      { name: '나무 자세 (Tree Pose)', body_part: '기타', pain_level: 1, equipment_types: ['없음'], experience_level: '초보', duration_minutes: 3, description: '균형 감각 및 집중력 향상', instructions: '한 발로 서서 다른 발바닥을 허벅지 안쪽에 댑니다. 손을 가슴 앞에 모읍니다.', precautions: '넘어지지 않게 주의하세요.' },
      { name: '전사 자세 (Warrior Pose)', body_part: '기타', pain_level: 2, equipment_types: ['매트'], experience_level: '중급', duration_minutes: 5, description: '하체 근력 및 전신 스트레칭', instructions: '다리를 넓게 벌리고 한쪽 무릎을 굽힙니다. 팔을 양옆으로 뻗습니다.', precautions: '무릎이 발목 위에 오게 하세요.' }
    ]
  }

  return defaultExercises[bodyPart] || []
}

/**
 * 운동 템플릿이 부족할 때 자동으로 추가
 */
export async function autoAddExerciseTemplates(
  bodyPart: string,
  painLevel: number
): Promise<{ success: boolean; added: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    // 현재 해당 부위의 운동 템플릿 개수 확인
    const { data: existing, error: checkError } = await supabase
      .from("exercise_templates")
      .select("id, name")
      .eq("body_part", bodyPart)
      .lte("pain_level", painLevel)

    if (checkError) {
      return { success: false, added: 0, error: checkError.message }
    }

    // 운동이 5개 미만이면 추가 -> 제한 제거: 항상 모든 운동 추가 시도
    // if (existing && existing.length < 5) {
      const exerciseData = await fetchExerciseDataFromPublicSources(bodyPart, painLevel)
      const existingNames = new Set(existing?.map(e => e.name) || [])
      
      // 중복 제거
      const newExercises = exerciseData.filter(
        (ex) => !existingNames.has(ex.name)
      )

      if (newExercises.length > 0) {
        const { error: insertError } = await supabase
          .from("exercise_templates")
          .insert(newExercises)

        if (insertError) {
          return { success: false, added: 0, error: insertError.message }
        }

        return { success: true, added: newExercises.length }
      }
    // }

    return { success: true, added: 0 }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { success: false, added: 0, error: errorMessage }
  }
}

/**
 * 공개 API를 사용한 운동 데이터 가져오기 (예시)
 * 실제 구현 시 ExerciseDB, Open Exercise Database 등의 API 사용
 */
export async function fetchExercisesFromPublicAPI(
  bodyPart: string
): Promise<ExerciseData[]> {
  // 예시: ExerciseDB API 사용 (실제 API 키 필요)
  // const response = await fetch(`https://api.exercisedb.io/v1/exercises?bodyPart=${bodyPart}`)
  // const data = await response.json()
  
  // 현재는 기본 데이터 반환
  return []
}

