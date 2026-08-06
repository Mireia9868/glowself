// ai.js - AI Integration: Qwen-VL (vision) + DeepSeek (report generation)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-vl-plus';

async function callAPI(baseUrl, apiKey, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API ${response.status}: ${errText}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ===== Image Analysis (Qwen-VL) =====
async function analyzeImage(imageBase64, type = 'user') {
  if (!QWEN_API_KEY) return null;

  const prompt =
    type === 'ideal'
      ? '请分析这张参考照片的风格特征，包括：1.整体风格定位 2.服装风格与廓形 3.发型特征 4.妆容风格 5.色彩搭配 6.气质特点。请用中文客观描述，200字以内。'
      : '请详细分析这张人物照片，包括：1.面部轮廓和脸型 2.五官特征（眉、眼、鼻、唇的形状和比例）3.整体气质和第一印象 4.发型特征 5.肤色和肤质（如可见）6.整体风格定位。请用中文详细客观地描述，注重细节，300字以内。';

  try {
    const result = await callAPI(QWEN_BASE_URL, QWEN_API_KEY, {
      model: QWEN_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
      max_tokens: 800,
    });
    return result.choices[0].message.content || null;
  } catch (err) {
    console.error('[Vision API] Error:', err.message);
    return null;
  }
}

// ===== Report Generation (DeepSeek) =====
async function generateReport(params) {
  const { imageDescription, idealDescription, height, weight, skinType, stylePreference, reportCount, reportType = 'basic' } = params;

  const bmi = calculateBMI(height, weight);
  const isVisionAvailable = !!imageDescription;

  const systemPrompt = `你是"光绽"(GlowSelf)平台的专业面部美学分析师，生成极简、高端、数据导向的分析报告。

【核心原则】
1. 客观、理性、数据驱动
2. 诚实指出可优化空间，禁用"丑""缺陷""难看"等负面词
3. 拒绝容貌焦虑，强调每位用户独特的优势
4. 建议具体可执行
5. 综合评分 0-10 分制（1位小数，6.5-9.0为合理区间）
6. 文风：精炼、克制、专业${reportType !== 'basic' ? '\n7. 本报告为' + (reportType === 'vip' ? 'VIP' : '深度') + '版，需在基础分析上提供更详细、更专业的延伸内容' : ''}

【严格要求】必须输出我指定的 JSON 字段，不要新增、删除或重命名字段，不要输出 markdown 代码块。`;

  const today = new Date().toISOString().slice(0, 10);
  const reportNo = `FA-${today.replace(/-/g, '').slice(0,4)}-${String(Math.floor(Math.random()*9000)+1000)}`;

  // Build extra schema fields based on report type
  let extraSchema = '';
  let extraInstructions = '';

  if (reportType === 'deep' || reportType === 'vip') {
    extraSchema += `,
  "skincareRoutine": {
    "morning": "晨间护肤步骤（含产品类型建议）",
    "evening": "晚间护肤步骤",
    "weekly": "每周特殊护理建议"
  },
  "makeupTutorial": {
    "base": "底妆方案（粉底色号方向、遮瑕重点）",
    "eyes": "眼妆方案（眼影色系、眼线画法）",
    "lips": "唇妆方案（唇色选择）",
    "steps": "完整妆容步骤摘要（5-6步）"
  },
  "hairstyleSuggestions": [
    {"name":"发型名称","desc":"适合原因及打理要点","faceShapeMatch":"适配脸型"}
  ],
  "colorDiagnosis": {
    "season": "个人色彩季型（如暖春/冷夏/柔秋/净冬）",
    "bestColors": ["推荐色1","推荐色2","推荐色3","推荐色4"],
    "avoidColors": ["不宜色1","不宜色2"]
  }`;
    extraInstructions += '\n- 深度报告专属：skincareRoutine（早晚+周护理）、makeupTutorial（底妆/眼妆/唇妆+步骤）、hairstyleSuggestions（3-5款发型）、colorDiagnosis（色彩季型+推荐/不宜色）';
  }

  if (reportType === 'vip') {
    extraSchema += `,
  "shoppingList": [
    {"category":"护肤/彩妆/服饰/配饰","brand":"品牌名","product":"具体产品名","priceRange":"价格区间","reason":"推荐理由"}
  ],
  "consultantAdvice": "如果进行30分钟1v1形象顾问咨询，顾问会重点关注的3个方向及初步建议"`;
    extraInstructions += '\n- VIP报告专属：shoppingList（5-8个具体产品推荐含品牌和价格）、consultantAdvice（顾问咨询重点方向）';
  }

  const userPrompt = `请基于以下信息生成一份"面部美学分析报告"。

=== 用户数据 ===
- 身高：${height}cm
- 体重：${weight}kg
- BMI：${bmi}
- 肤质类型：${skinType || '未指定'}
- 期望风格：${stylePreference || '不限'}
- 分析日期：${today}
- 报告编号：${reportNo}
- 报告类型：${reportType === 'basic' ? '基础报告' : reportType === 'deep' ? '深度报告' : 'VIP报告'}
${reportCount > 0 ? `- 第 ${reportCount + 1} 次分析（请在结论中体现成长）` : '- 首次分析'}

=== 照片视觉描述 ===
${imageDescription || '（视觉分析暂不可用，请基于通用美学原则分析）'}

${idealDescription ? `=== 理想形象描述 ===\n${idealDescription}\n` : ''}
=== 输出要求 ===
1. 仅输出一个 JSON 对象，不要任何 markdown 包装
2. 严格按以下字段名输出，不要新增、删除或重命名：${extraInstructions}

{
  "reportNo": "${reportNo}",
  "analysisDate": "${today}",
  "reportType": "${reportType}",
  "basicInfo": {
    "gender": "男/女（根据照片判断）",
    "ageRange": "如20-25岁",
    "bmi": "${bmi}",
    "height": "${height}",
    "weight": "${weight}"
  },
  "contour": {
    "faceShape": "脸型",
    "jawline": "下颌线特征",
    "forehead": "额头特征",
    "eyePosition": "眼位",
    "featureConcentration": "五官集中度"
  },
  "overallScore": 综合评分数字如8.3,
  "scoreTitle": "3个标签用 | 分隔",
  "overallComment": "3-4句总体评价",
  "dimensionScores": [
    {"name":"对称性","score":8.0,"comment":"说明"},
    {"name":"面部比例","score":8.0,"comment":"说明"},
    {"name":"骨骼结构","score":8.0,"comment":"说明"},
    {"name":"皮肤状态","score":8.0,"comment":"说明"},
    {"name":"五官精致度","score":8.0,"comment":"说明"},
    {"name":"气质表现力","score":8.0,"comment":"说明"},
    {"name":"整体协调性","score":8.0,"comment":"说明"}
  ],
  "detailedAnalysis": {
    "symmetry": "对称性2-3句",
    "facialProportion": "三庭五眼2-3句",
    "boneStructure": "骨骼结构2-3句",
    "skinCondition": "皮肤2-3句",
    "eyes": "眼睛2-3句",
    "nose": "鼻子2-3句",
    "lips": "嘴唇2-3句",
    "aura": "气质2-3句"
  },
  "strengths": ["优势1","优势2","优势3","优势4","优势5"],
  "improvements": ["可优化1","可优化2","可优化3","可优化4"],
  "suggestions": {
    "contour": "轮廓优化",
    "feature": "五官精修",
    "makeup": "妆容方向",
    "hairstyle": "发型建议",
    "outfit": "穿搭风格",
    "photoAngle": "拍照建议",
    "skincare": "护肤建议",
    "posture": "仪态建议"
  },
  "seasonalStyle": {
    "spring": "春季穿搭",
    "summer": "夏季穿搭",
    "autumn": "秋季穿搭",
    "winter": "冬季穿搭"
  },
  "fitnessAdvice": "健身与体态建议（基于BMI）",
  "brandRecommendations": [
    {"name":"品牌名","desc":"推荐理由","priceRange":"价格区间"}
  ],
  "comparisonAdvice": "${idealDescription ? '理想形象对比与调整建议200字' : ''}",
  "conclusion": "结论总结3-4句",
  "growthPotential": "可达到的综合评分上限如8.8+",
  "rating": {
    "stars": 4.0,
    "score": 8.3
  }${extraSchema}
}`;

  const maxTokens = reportType === 'basic' ? 6000 : 8000;

  try {
    const result = await callAPI(DEEPSEEK_BASE_URL, DEEPSEEK_API_KEY, {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    let content = result.choices[0].message.content || '';

    // Strip markdown fences
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Find JSON object
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    const report = JSON.parse(content);
    return { ...report, visionAvailable: isVisionAvailable };
  } catch (err) {
    console.error('[DeepSeek] Error:', err.message);
    throw new Error('报告生成失败: ' + err.message);
  }
}

// ===== Helper =====
function calculateBMI(height, weight) {
  if (!height || !weight) return null;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

async function checkVisionAPI() {
  if (!QWEN_API_KEY) return false;
  try {
    const result = await callAPI(QWEN_BASE_URL, QWEN_API_KEY, {
      model: QWEN_MODEL,
      messages: [{ role: 'user', content: 'Reply: OK' }],
      max_tokens: 5,
    });
    return !!result.choices;
  } catch {
    return false;
  }
}

module.exports = { analyzeImage, generateReport, calculateBMI, checkVisionAPI };
