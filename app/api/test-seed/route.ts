import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const templates = [
    // --- 목 (Neck) ---
    {
      name: '턱 당기기 (Chin Tuck)',
      body_part: '목',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '거북목 교정 및 목 근육 강화',
      instructions: '턱을 목 쪽으로 당겨 이중턱을 만듭니다. 10초간 유지합니다.',
      precautions: '고개를 너무 숙이지 않도록 주의하세요.'
    },
    {
      name: '목 굽히기/펴기',
      body_part: '목',
      pain_level: 2,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '목 가동범위 개선',
      instructions: '천천히 고개를 앞으로 숙였다가 뒤로 젖힙니다.',
      precautions: '통증이 없는 범위 내에서 움직이세요.'
    },
    {
      name: '목 좌우 돌리기',
      body_part: '목',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '목 근육 긴장 완화',
      instructions: '고개를 좌우로 천천히 돌려 어깨 너머를 봅니다.',
      precautions: '어깨가 따라 움직이지 않도록 고정하세요.'
    },
    {
      name: '흉쇄유돌근 스트레칭',
      body_part: '목',
      pain_level: 2,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '목 옆쪽 근육 이완',
      instructions: '한 손으로 쇄골을 잡고 고개를 반대쪽 대각선 뒤로 젖힙니다.',
      precautions: '너무 강하게 당기지 마세요.'
    },
    {
      name: '덤벨 슈러그',
      body_part: '목',
      pain_level: 2,
      equipment_types: ['덤벨'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '승모근 강화',
      instructions: '덤벨을 들고 어깨를 귀 쪽으로 으쓱 올렸다가 천천히 내립니다.',
      precautions: '팔꿈치를 굽히지 마세요.'
    },

    // --- 허리 (Back/Waist) ---
    {
      name: '고양이 자세 (Cat-Cow)',
      body_part: '허리',
      pain_level: 1,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '척추 유연성 향상',
      instructions: '네발기기 자세에서 등을 둥글게 말았다가 펴는 동작을 반복합니다.',
      precautions: '허리를 과도하게 꺾지 마세요.'
    },
    {
      name: '버드독 (Bird-Dog)',
      body_part: '허리',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '코어 안정성 강화',
      instructions: '네발기기 자세에서 반대쪽 팔과 다리를 동시에 들어 올립니다.',
      precautions: '골반이 틀어지지 않도록 주의하세요.'
    },
    {
      name: '브릿지 (Bridge)',
      body_part: '허리',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '둔근 및 허리 강화',
      instructions: '누워서 무릎을 세우고 엉덩이를 들어 올립니다.',
      precautions: '허리가 아닌 엉덩이 힘으로 들어 올리세요.'
    },
    {
      name: '맥켄지 신전 운동',
      body_part: '허리',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '허리 디스크 통증 완화',
      instructions: '엎드린 자세에서 상체를 천천히 일으켜 세웁니다.',
      precautions: '통증이 심해지면 즉시 중단하세요.'
    },
    {
      name: '플랭크 (Plank)',
      body_part: '허리',
      pain_level: 3,
      equipment_types: ['매트'],
      experience_level: '중급',
      duration_minutes: 5,
      description: '전신 코어 강화',
      instructions: '팔꿈치와 발끝으로 몸을 지탱하여 일직선을 유지합니다.',
      precautions: '허리가 아래로 처지지 않도록 복부에 힘을 주세요.'
    },

    // --- 무릎 (Knee) ---
    {
      name: '대퇴사두근 힘주기 (Quad Sets)',
      body_part: '무릎',
      pain_level: 1,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '무릎 주변 근육 강화',
      instructions: '다리를 펴고 앉아 무릎 뒤쪽으로 바닥을 누르며 허벅지에 힘을 줍니다.',
      precautions: '무릎에 통증이 없어야 합니다.'
    },
    {
      name: '다리 들어올리기 (SLR)',
      body_part: '무릎',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '허벅지 근력 강화',
      instructions: '누워서 한쪽 다리를 45도 정도 들어 올렸다가 천천히 내립니다.',
      precautions: '무릎을 굽히지 않고 곧게 펴서 수행하세요.'
    },
    {
      name: '발뒤꿈치 끌기 (Heel Slides)',
      body_part: '무릎',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '무릎 관절 가동범위 회복',
      instructions: '누워서 발뒤꿈치를 엉덩이 쪽으로 당겨 무릎을 굽힙니다.',
      precautions: '통증이 없는 범위까지만 굽히세요.'
    },
    {
      name: '벽 스쿼트',
      body_part: '무릎',
      pain_level: 3,
      equipment_types: ['없음'],
      experience_level: '중급',
      duration_minutes: 10,
      description: '하체 근력 강화',
      instructions: '벽에 등을 대고 무릎을 굽혀 투명의자 자세를 유지합니다.',
      precautions: '무릎이 발끝보다 앞으로 나가지 않도록 하세요.'
    },
    {
      name: '레그 익스텐션 (머신)',
      body_part: '무릎',
      pain_level: 2,
      equipment_types: ['머신'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '대퇴사두근 고립 강화',
      instructions: '머신에 앉아 다리를 펴서 들어 올립니다.',
      precautions: '반동을 이용하지 말고 천천히 수행하세요.'
    },

    // --- 어깨 (Shoulder) ---
    {
      name: '시계추 운동',
      body_part: '어깨',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '어깨 관절 이완',
      instructions: '상체를 숙이고 팔을 늘어뜨려 시계추처럼 부드럽게 흔듭니다.',
      precautions: '팔에 힘을 완전히 빼고 수행하세요.'
    },
    {
      name: '밴드 외회전',
      body_part: '어깨',
      pain_level: 2,
      equipment_types: ['밴드'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '회전근개 강화',
      instructions: '팔꿈치를 옆구리에 붙이고 밴드를 바깥쪽으로 당깁니다.',
      precautions: '팔꿈치가 몸에서 떨어지지 않도록 주의하세요.'
    },
    {
      name: '벽 밀기 (Wall Push-up)',
      body_part: '어깨',
      pain_level: 2,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '어깨 및 상체 근력 강화',
      instructions: '벽을 짚고 서서 팔굽혀펴기를 하듯 몸을 밀어냅니다.',
      precautions: '몸이 일직선이 되도록 유지하세요.'
    },
    {
      name: '슬리퍼 스트레칭',
      body_part: '어깨',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '어깨 내회전 가동범위 증가',
      instructions: '옆으로 누워 팔을 90도로 굽히고 반대 손으로 손목을 눌러 내립니다.',
      precautions: '통증이 심하면 즉시 중단하세요.'
    },
    {
      name: '숄더 프레스 (머신)',
      body_part: '어깨',
      pain_level: 3,
      equipment_types: ['머신'],
      experience_level: '중급',
      duration_minutes: 15,
      description: '어깨 전반적인 근력 강화',
      instructions: '머신에 앉아 손잡이를 위로 밀어 올립니다.',
      precautions: '어깨가 으쓱하지 않도록 주의하세요.'
    }
  ]

  // 데이터 삽입 (기존 데이터 유지, 중복 시 업데이트 안 함 - id가 없으므로 insert로 계속 추가될 수 있음. 
  // 실제로는 name으로 중복 체크를 하거나 해야 하지만, 테스트용이므로 일단 insert)
  // 더 안전하게 하기 위해 upsert를 쓰되, name을 기준으로 하거나 기존 데이터를 지우고 다시 넣는게 깔끔할 수 있음.
  // 여기서는 간단히 insert 하되, 중복 방지를 위해 select 후 insert 로직을 추가하거나, 
  // 그냥 간단히 실행할 때마다 추가되는 것을 감수하고 진행 (테스트용이므로).
  // 하지만 깔끔하게 하기 위해 기존 데이터를 지우는 것은 위험할 수 있으니, 
  // upsert를 사용하려면 unique constraint가 있어야 함.
  // 여기서는 그냥 insert로 진행.

  const { error } = await supabase.from('exercise_templates').insert(templates)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: `Successfully seeded ${templates.length} exercises` })
}
