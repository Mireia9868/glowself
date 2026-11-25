/* GlowSelf v2 — shared data, quiz questions and the colour/style engine.
   No dependencies. All calculations run client-side so the free test works
   before login and on any static host. */
(function () {
  'use strict';

  const seasons = {
    'soft-autumn': {
      id: 'soft-autumn', name: '柔暖秋', en: 'Soft Autumn', family: '秋',
      tagline: '像一杯加了燕麦奶的拿铁，柔和、耐看、有温度。',
      description: '你的底色偏暖，但饱和度不高。最适合低对比、带灰调的自然色，而不是高饱和亮色或冷调纯白。',
      palette: [
        ['#C98B6B', '杏仁'], ['#D8A47F', '焦糖'], ['#A98467', '陶土'], ['#6B705C', '橄榄'],
        ['#B7B7A4', '鼠尾草'], ['#E8D5C4', '奶油'], ['#8C6A5D', '可可'], ['#DDBEA9', '雾粉'],
        ['#A5A58D', '苔藓'], ['#CB997E', '肉桂'], ['#FFE8D6', '燕麦'], ['#7F5539', '暖棕']
      ],
      avoid: ['荧光白', '冷调灰蓝', '高饱和玫红', '纯黑大面积'],
      metal: '哑光金、古金、黄铜',
      lip: '豆沙玫瑰 / 焦糖奶茶',
      blush: '杏桃 / 暖珊瑚',
      eye: '可可 / 橄榄 / 香槟',
      hair: '栗棕、焦糖棕、摩卡；避免冷灰金',
      formulas: [
        '奶油针织 + 燕麦阔腿裤 + 焦糖腰带',
        '雾粉衬衫 + 可可半裙 + 裸色乐福鞋',
        '橄榄工装 + 白 T + 棕色托特包'
      ],
      keywords: ['低饱和', '暖调', '自然感', '耐看']
    },
    'warm-autumn': {
      id: 'warm-autumn', name: '暖秋', en: 'Warm Autumn', family: '秋',
      tagline: '像秋日午后的香料市集，浓郁、温暖、有存在感。',
      description: '你的底色明显偏暖，适合像南瓜、赤陶、橄榄这样有土壤感的颜色。比起冷调粉彩，你更能驾驭有厚度的暖色。',
      palette: [
        ['#B5651D', '南瓜'], ['#C97B3D', '赤陶'], ['#8A5A2B', '铁锈'], ['#6B7B3A', '橄榄'],
        ['#D9A441', '蜂蜜'], ['#A63A2B', '砖红'], ['#E3C08D', '驼色'], ['#7A4E2D', '棕红'],
        ['#556B2F', '森林'], ['#C2A878', '暖米'], ['#8B3A2E', '酒红'], ['#D4B483', '香槟']
      ],
      avoid: ['冷调灰粉', '冰蓝', '荧光色', '纯白'],
      metal: '金色、黄铜、做旧金',
      lip: '砖红 / 南瓜棕 / 暖豆沙',
      blush: '杏色 / 烤珊瑚',
      eye: '金棕 / 橄榄 / 铜色',
      hair: '深栗、铜棕、巧克力；避免冷黑',
      formulas: [
        '驼色风衣 + 橄榄针织 + 深棕直筒裤',
        '砖红衬衫 + 暖米半裙 + 金色耳环',
        '南瓜针织 + 深蓝牛仔 + 棕色短靴'
      ],
      keywords: ['暖调', '浓郁', '土壤感', '大气']
    },
    'deep-autumn': {
      id: 'deep-autumn', name: '深暖秋', en: 'Deep Autumn', family: '秋',
      tagline: '像深秋的森林与红酒，沉静、浓郁、有力量。',
      description: '你的发色、瞳色和肤色对比偏深，底色偏暖。适合有深度、带一点灰度的浓郁色，太浅太甜的颜色容易显得没精神。',
      palette: [
        ['#5B2E2A', '酒红'], ['#7A3E2F', '深棕'], ['#4A3B2A', '咖啡'], ['#6B4F2A', '琥珀'],
        ['#8C5A2B', '铁锈'], ['#3F4A3C', '墨绿'], ['#A0522D', '赭石'], ['#6E2C2C', '深莓'],
        ['#B8860B', '金棕'], ['#2F3E2E', '松针'], ['#C97B4A', '陶土'], ['#8B4513', '巧克力']
      ],
      avoid: ['马卡龙粉', '浅冰蓝', '荧光黄', '浅灰'],
      metal: '古金、黄铜、哑光金',
      lip: '酒红 / 枫叶棕 / 赤陶',
      blush: '烤杏 / 砖粉',
      eye: '深棕 / 橄榄 / 古铜',
      hair: '深巧克力、黑茶、深栗；避免浅金',
      formulas: [
        '墨绿大衣 + 酒红针织 + 深棕皮靴',
        '巧克力西装 + 琥珀衬衫 + 金色耳环',
        '铁锈连衣裙 + 深棕腰带 + 复古金包'
      ],
      keywords: ['深色', '浓郁', '高质感', '力量感']
    },
    'light-spring': {
      id: 'light-spring', name: '浅春', en: 'Light Spring', family: '春',
      tagline: '像刚切开的蜜桃与清晨的奶油，轻盈、透亮、柔软。',
      description: '你的整体明度偏高，底色偏暖。适合浅而清透的颜色，厚重深色会压住你的轻盈感。',
      palette: [
        ['#FFB5A7', '蜜桃'], ['#FCD5CE', '杏色'], ['#F8EDEB', '奶油'], ['#FEC89A', '浅珊瑚'],
        ['#F9DCC4', '浅金'], ['#D8E2DC', '薄荷'], ['#FFE5D9', '鹅黄'], ['#D4A373', '浅驼'],
        ['#FDE2E4', '玫瑰'], ['#BDE0FE', '海盐蓝'], ['#FEFAE0', '香槟'], ['#FFF1E6', '象牙']
      ],
      avoid: ['纯黑', '深酒红', '荧光色', '厚重金属'],
      metal: '浅金、香槟金、珍珠',
      lip: '蜜桃 / 珊瑚 / 浅玫瑰',
      blush: '蜜桃 / 浅珊瑚',
      eye: '香槟 / 浅棕 / 蜜桃',
      hair: '浅棕、蜂蜜茶、奶茶；避免蓝黑',
      formulas: [
        '奶油针织 + 蜜桃半裙 + 浅金耳线',
        '浅驼风衣 + 白 T + 杏色直筒裤',
        '海盐蓝衬衫 + 奶油白牛仔 + 裸色鞋'
      ],
      keywords: ['浅色', '清透', '轻盈', '柔和']
    },
    'warm-spring': {
      id: 'warm-spring', name: '暖春', en: 'Warm Spring', family: '春',
      tagline: '像刚好的阳光，明亮、鲜活、有生命力。',
      description: '你的底色偏暖，明度中等，适合清澈但不刺眼的暖色。你穿珊瑚、金盏黄、草绿会比穿灰调更显气色。',
      palette: [
        ['#E07A5F', '珊瑚'], ['#F2CC8F', '金盏'], ['#81B29A', '草绿'], ['#F4A261', '蜜桃橙'],
        ['#E9C46A', '芒果'], ['#D4A373', '浅驼'], ['#FAEDCD', '奶油'], ['#CCD5AE', '黄绿'],
        ['#E76F51', '番茄'], ['#FEFAE0', '暖白'], ['#2A9D8F', '松石'], ['#F6BD60', '蜂蜜']
      ],
      avoid: ['冷灰', '深紫', '荧光粉', '纯黑'],
      metal: '亮金、浅金、珍珠',
      lip: '珊瑚 / 番茄 / 蜜桃',
      blush: '珊瑚 / 杏色',
      eye: '金棕 / 蜜桃 / 浅橄榄',
      hair: '蜂蜜棕、浅栗、暖茶；避免冷灰',
      formulas: [
        '珊瑚针织 + 奶油白牛仔 + 草绿包',
        '浅驼西装 + 金盏黄内搭 + 棕色鞋',
        '松石连衣裙 + 金色耳环 + 裸色凉鞋'
      ],
      keywords: ['暖调', '明亮', '鲜活', '亲和']
    },
    'clear-spring': {
      id: 'clear-spring', name: '亮春', en: 'Clear Spring', family: '春',
      tagline: '像一束打在高饱和色板上的光，鲜明、利落、抓眼。',
      description: '你的对比度偏高，适合干净、饱和、没有灰调的颜色。你穿正红、亮橙、宝蓝会比穿莫兰迪色更有精神。',
      palette: [
        ['#FF595E', '正红'], ['#FFCA3A', '亮黄'], ['#8AC926', '草绿'], ['#1982C4', '宝蓝'],
        ['#6A4C93', '紫罗兰'], ['#FF924C', '亮橙'], ['#FFD23F', '柠檬'], ['#00B4D8', '青蓝'],
        ['#90BE6D', '苹果绿'], ['#F94144', '樱桃'], ['#F9C74F', '金黄'], ['#43AA8B', '翡翠']
      ],
      avoid: ['灰调莫兰迪', '浑浊土色', '浅灰', '暗紫'],
      metal: '亮银、亮金、亚克力',
      lip: '正红 / 亮橙 / 莓果',
      blush: '亮珊瑚 / 玫瑰',
      eye: '亮棕 / 金 / 蓝绿',
      hair: '乌黑、深棕、红棕；避免灰调',
      formulas: [
        '正红针织 + 白牛仔 + 亮银耳环',
        '宝蓝衬衫 + 亮黄半裙 + 白色鞋',
        '草绿西装 + 黑 T + 樱桃红包'
      ],
      keywords: ['高饱和', '高对比', '鲜明', '利落']
    },
    'soft-summer': {
      id: 'soft-summer', name: '柔夏', en: 'Soft Summer', family: '夏',
      tagline: '像一场有雾的清晨，安静、克制、耐人寻味。',
      description: '你的底色偏冷或中性，饱和度低。最适合带灰调的柔和色，太亮太暖的颜色容易抢走你的气质。',
      palette: [
        ['#A8A6B4', '雾紫'], ['#8E9AAF', '灰蓝'], ['#CBC0D3', '薰衣草'], ['#EFD3D7', '灰粉'],
        ['#DEE2E6', '银灰'], ['#B8B8D1', '雾蓝'], ['#9A8C98', '豆沙'], ['#C9ADA7', '玫瑰灰'],
        ['#A5A58D', '鼠尾草'], ['#B0A8B9', '紫灰'], ['#D8CFD0', '燕麦'], ['#6D6875', '深灰紫']
      ],
      avoid: ['荧光色', '正红', '亮橙', '纯黑'],
      metal: '银、哑光银、珍珠',
      lip: '豆沙 / 玫瑰灰 / 莓果',
      blush: '灰粉 / 冷玫瑰',
      eye: '灰棕 / 薰衣草 / 银灰',
      hair: '冷棕、灰棕、黑茶；避免铜橙',
      formulas: [
        '雾蓝衬衫 + 灰粉半裙 + 银色耳环',
        '鼠尾草针织 + 燕麦阔腿裤 + 灰包',
        '薰衣草连衣裙 + 银灰鞋 + 珍珠项链'
      ],
      keywords: ['低饱和', '冷调', '雾感', '克制']
    },
    'cool-summer': {
      id: 'cool-summer', name: '冷夏', en: 'Cool Summer', family: '夏',
      tagline: '像海水漫过石头，清冷、通透、有距离感。',
      description: '你的底色偏冷，适合蓝、灰、莓果这类冷调色。暖橘、土黄容易让肤色显得暗沉。',
      palette: [
        ['#6D9DC5', '雾蓝'], ['#9BB7D4', '冰蓝'], ['#B8C0D9', '紫灰'], ['#6B7A8F', '灰蓝'],
        ['#A3B18A', '灰绿'], ['#C9D6DF', '冷白'], ['#7D8CA3', '石板蓝'], ['#B6C4D6', '天青'],
        ['#5C6B73', '深灰蓝'], ['#D6E2E9', '雾白'], ['#8FA3B0', '海盐'], ['#4A5A6A', '海军蓝']
      ],
      avoid: ['南瓜橙', '土黄', '暖棕', '荧光绿'],
      metal: '银、白金、珍珠',
      lip: '莓果 / 冷玫瑰 / 梅子',
      blush: '冷粉 / 莓果',
      eye: '灰蓝 / 冷棕 / 银灰',
      hair: '冷棕、蓝黑、灰茶；避免铜色',
      formulas: [
        '冰蓝衬衫 + 海军蓝西裤 + 银饰',
        '灰绿针织 + 冷白半裙 + 灰蓝包',
        '石板蓝大衣 + 雾白内搭 + 黑靴'
      ],
      keywords: ['冷调', '清透', '蓝灰', '距离感']
    },
    'light-summer': {
      id: 'light-summer', name: '浅夏', en: 'Light Summer', family: '夏',
      tagline: '像被水洗过的花瓣，轻盈、干净、透明。',
      description: '你的明度偏高，底色偏冷。适合浅而干净的冷调色，深重颜色会显得压气色。',
      palette: [
        ['#BDE0FE', '冰蓝'], ['#A2D2FF', '浅蓝'], ['#CDB4DB', '丁香'], ['#FFC8DD', '冰粉'],
        ['#FFAFCC', '浅玫瑰'], ['#D0F4DE', '薄荷'], ['#E4C1F9', '浅紫'], ['#C8E7FF', '天青'],
        ['#F1E3F3', '雾白'], ['#B8E0D2', '海盐'], ['#D6EAF8', '水蓝'], ['#E8D5E8', '珍珠']
      ],
      avoid: ['深棕', '纯黑', '南瓜橙', '高饱和红'],
      metal: '银、白金、珍珠',
      lip: '浅玫瑰 / 冰莓 / 裸粉',
      blush: '冰粉 / 浅梅',
      eye: '冰棕 / 丁香 / 银白',
      hair: '浅冷棕、灰茶、亚麻；避免深黑',
      formulas: [
        '冰蓝衬衫 + 雾白牛仔 + 银饰',
        '丁香针织 + 浅灰半裙 + 珍珠耳环',
        '薄荷连衣裙 + 裸色鞋 + 浅银包'
      ],
      keywords: ['浅色', '冷调', '透明', '轻盈']
    },
    'clear-winter': {
      id: 'clear-winter', name: '净冬', en: 'Clear Winter', family: '冬',
      tagline: '像黑夜里的一束冷光，干净、锐利、过目不忘。',
      description: '你的对比度高，底色偏冷。最适合纯正、饱和、边界清晰的颜色，灰调和浊色会让你失去锋芒。',
      palette: [
        ['#0B132B', '墨黑'], ['#1C2541', '深蓝'], ['#C1121F', '正红'], ['#5BC0BE', '冰绿'],
        ['#FFFFFF', '纯白'], ['#E63946', '樱桃'], ['#A8DADC', '冰蓝'], ['#457B9D', '宝蓝'],
        ['#FF006E', '亮粉'], ['#8338EC', '电紫'], ['#F1FAEE', '冷白'], ['#3A506B', '海军蓝']
      ],
      avoid: ['灰调莫兰迪', '土黄', '暖棕', '浑浊绿'],
      metal: '亮银、白金、几何金属',
      lip: '正红 / 莓果 / 梅子',
      blush: '冷玫瑰 / 浅莓',
      eye: '冰棕 / 银灰 / 深蓝',
      hair: '乌黑、蓝黑、深冷棕；避免铜金',
      formulas: [
        '黑色西装 + 纯白衬衫 + 正红唇',
        '宝蓝大衣 + 冰蓝内搭 + 银饰',
        '樱桃红针织 + 深蓝牛仔 + 黑靴'
      ],
      keywords: ['高对比', '冷调', '鲜明', '锐利']
    },
    'cool-winter': {
      id: 'cool-winter', name: '冷冬', en: 'Cool Winter', family: '冬',
      tagline: '像深冬的宝石，冷冽、浓郁、有质感。',
      description: '你的底色偏冷，明度中深。适合宝石色和冷调深色，暖橘、土棕会破坏你的清冷感。',
      palette: [
        ['#1B263B', '炭黑'], ['#415A77', '深灰蓝'], ['#778DA9', '灰蓝'], ['#E0E1DD', '冷白'],
        ['#0D1B2A', '墨蓝'], ['#7B2CBF', '紫罗兰'], ['#3C096C', '深紫'], ['#5A189A', '梅子'],
        ['#9D4EDD', '亮紫'], ['#C77DFF', '丁香紫'], ['#4361EE', '宝蓝'], ['#4CC9F0', '冰蓝']
      ],
      avoid: ['南瓜橙', '土黄', '暖棕', '荧光绿'],
      metal: '银、白金、亮面金属',
      lip: '梅子 / 酒红 / 冷莓',
      blush: '冷玫瑰 / 梅子',
      eye: '深紫 / 银灰 / 宝蓝',
      hair: '蓝黑、深紫棕、冷黑；避免暖铜',
      formulas: [
        '深灰蓝大衣 + 冷白针织 + 银饰',
        '梅子针织 + 炭黑半裙 + 黑靴',
        '宝蓝西装 + 丁香紫内搭 + 冷白裤'
      ],
      keywords: ['冷调', '宝石色', '深色', '质感']
    },
    'deep-winter': {
      id: 'deep-winter', name: '深冬', en: 'Deep Winter', family: '冬',
      tagline: '像一杯深色红酒，浓烈、神秘、有掌控感。',
      description: '你的发色、瞳色深，对比强。适合深而纯的颜色，太浅太灰的颜色会让你显得没精神。',
      palette: [
        ['#0B090A', '纯黑'], ['#161A1D', '炭黑'], ['#660708', '深酒红'], ['#A4161A', '正红'],
        ['#BA181B', '樱桃'], ['#E5383B', '亮红'], ['#B1A7A6', '冷灰'], ['#D3D3D3', '银灰'],
        ['#F5F3F4', '纯白'], ['#2B2D42', '深蓝'], ['#8D99AE', '灰蓝'], ['#EF233C', '莓红']
      ],
      avoid: ['马卡龙色', '浅驼', '暖黄', '灰粉'],
      metal: '亮银、白金、黑金',
      lip: '酒红 / 正红 / 深莓',
      blush: '冷玫瑰 / 莓果',
      eye: '深棕 / 炭灰 / 酒红',
      hair: '乌黑、蓝黑、深巧克力；避免浅金',
      formulas: [
        '黑色大衣 + 酒红针织 + 银饰',
        '炭灰西装 + 纯白衬衫 + 正红唇',
        '深蓝连衣裙 + 黑靴 + 亮银包'
      ],
      keywords: ['深色', '高对比', '冷调', '浓烈']
    }
  };

  const archetypes = {
    elegant: {
      id: 'elegant', name: '温婉优雅', en: 'Soft Elegant',
      tagline: '不费力的精致，比用力过猛更高级。',
      description: '你适合有垂坠感、线条柔和、细节克制的单品。重点不是堆砌装饰，而是面料、比例和一点点光泽。',
      keywords: ['垂坠', '中长线条', '珍珠', '低饱和'],
      silhouette: '收腰但不过分紧身，A 字与中长裙最友好',
      fabrics: '真丝、醋酸、细针织、羊毛混纺',
      pieces: ['中长半裙', 'V 领针织', '细腰带', '珍珠耳饰', '尖头低跟鞋'],
      avoid: '过度 oversize、荧光色、满身荷叶边',
      icon: '◐'
    },
    cool: {
      id: 'cool', name: '清冷知性', en: 'Cool Intellectual',
      tagline: '少一点讨好，多一点自己的边界。',
      description: '你适合干净利落的剪裁、冷静的颜色和克制的配饰。直线条和低对比会让你显得更高级。',
      keywords: ['直线条', '低对比', '银饰', '利落'],
      silhouette: 'H 型、直筒、微垫肩，避免过多曲线装饰',
      fabrics: '羊毛、西装料、真丝、挺括棉',
      pieces: ['直筒西裤', '廓形衬衫', '长款大衣', '银色耳线', '乐福鞋'],
      avoid: '蕾丝、蝴蝶结、荧光色、过度甜美',
      icon: '◇'
    },
    sweet: {
      id: 'sweet', name: '甜酷灵动', en: 'Sweet & Edgy',
      tagline: '把柔软和锋利放在同一套衣服里。',
      description: '你适合用一件甜、一件酷的混搭制造反差。短比例、硬挺面料和一点点亮色是你的记忆点。',
      keywords: ['混搭', '短比例', '皮革', '反差'],
      silhouette: '上短下长、A 字短裙、微廓形外套',
      fabrics: '皮革、牛仔、针织、金属感面料',
      pieces: ['短夹克', '百褶短裙', '厚底鞋', '金属项链', '亮色小包'],
      avoid: '全身碎花、过度成熟、拖沓长线条',
      icon: '✦'
    },
    natural: {
      id: 'natural', name: '自然松弛', en: 'Natural Relaxed',
      tagline: '像没刻意打扮，但每个细节都刚刚好。',
      description: '你适合天然面料、宽松但不邋遢的版型，以及大地色系。你的美来自状态，而不是紧绷的精致。',
      keywords: ['天然面料', '松量', '大地色', '呼吸感'],
      silhouette: '直筒、落肩、宽腿，腰线可松可收',
      fabrics: '亚麻、纯棉、粗针织、麂皮',
      pieces: ['亚麻衬衫', '宽腿裤', '帆布包', '平底凉鞋', '木质耳饰'],
      avoid: '紧身包臀、过度装饰、细高跟',
      icon: '❋'
    },
    retro: {
      id: 'retro', name: '复古文艺', en: 'Retro Romantic',
      tagline: '把旧时光的好品味，穿成自己的签名。',
      description: '你适合有故事感的颜色和材质，比如酒红、墨绿、丝绒和灯芯绒。重点在轮廓和配饰，不要全身都是戏。',
      keywords: ['浓郁色', '丝绒', '曲线', '故事感'],
      silhouette: '收腰、伞裙、方领、微卷发',
      fabrics: '丝绒、灯芯绒、粗花呢、羊毛',
      pieces: ['伞裙', '方领针织', '贝雷帽', '复古金饰', '玛丽珍鞋'],
      avoid: '运动风、荧光色、过度极简',
      icon: '❦'
    },
    minimal: {
      id: 'minimal', name: '极简现代', en: 'Modern Minimal',
      tagline: '当轮廓足够好，颜色就不需要太多。',
      description: '你适合单色、干净线条和有建筑感的单品。用材质和比例制造层次，而不是用图案。',
      keywords: ['单色', '建筑感', '干净线条', '质感'],
      silhouette: 'H 型、直筒、无多余装饰，重视肩线',
      fabrics: '羊毛、皮革、挺括棉、醋酸',
      pieces: ['廓形西装', '直筒裤', '白衬衫', '黑色乐福鞋', '几何耳环'],
      avoid: '碎花、荷叶边、过多配色、Logo 堆砌',
      icon: '▢'
    }
  };

  const bodyTypes = {
    X: { name: 'X 型 / 沙漏', advice: '强调腰线，上下保持平衡。裹身裙、收腰西装、细腰带都很友好；避免把腰完全遮住。' },
    H: { name: 'H 型 / 直筒', advice: '用层次和腰线制造曲线。短上衣 + 高腰下装、侧开衩、叠穿都能增加节奏；避免全身紧身。' },
    A: { name: 'A 型 / 梨形', advice: '把视觉重心放在肩颈和上半身。泡泡袖、方领、亮色上装 + 深色直筒下装；避免紧身包臀。' },
    O: { name: 'O 型 / 苹果', advice: '用纵向线条和 V 领拉长比例。长马甲、开衫、直筒裤；避免腰部过紧和横向分割。' },
    Y: { name: 'Y 型 / 倒三角', advice: '弱化肩部、增加下半身量感。V 领、落肩、A 字裙、阔腿裤；避免大垫肩和泡泡袖。' }
  };

  const goals = {
    outfit: { label: '每天穿什么', headline: '你缺的不是衣服，是筛选规则。', copy: '先建立自己的颜色和版型边界，再买衣服。衣柜会变小，但每件都能穿。' },
    makeup: { label: '化妆配色', headline: '你缺的不是技术，是适合你的色盘。', copy: '同一支口红在不同底色上完全是两种颜色。先选对色，再谈手法。' },
    hair: { label: '发型方向', headline: '你缺的不是新发型，是轮廓匹配。', copy: '发长、卷度、分缝和发色，应该服务于你的脸型与量感，而不是流行。' },
    color: { label: '找到本命色', headline: '你缺的不是白，是对的颜色。', copy: '让你显气色的不是更白的粉底，而是靠近脸部的颜色。' },
    confidence: { label: '建立自信', headline: '你缺的不是变美，是看见自己。', copy: '我们不给你打分。我们把你已经有的特征，翻译成更适合你的选择。' }
  };

  const questions = [
    {
      id: 'depth', label: '肤色深浅', prompt: '在自然光下，你的肤色更接近哪一档？',
      hint: '看素颜、没有滤镜的脖子和脸颊交界处。', type: 'single',
      options: [
        { value: 1, label: '象牙白 / 粉白', sub: '很容易晒红，不太容易晒黑' },
        { value: 2, label: '浅小麦 / 自然色', sub: '大多数亚洲肤色，晒后先红后微黑' },
        { value: 3, label: '小麦 / 橄榄', sub: '晒后容易变深，肤色偏金或偏绿' },
        { value: 4, label: '深棕 / 古铜', sub: '肤色深，晒后更深' }
      ]
    },
    {
      id: 'undertone', label: '皮肤底色', prompt: '你的皮肤底色更偏哪一边？',
      hint: '想象一张白纸放在脸旁：脸更偏粉，还是更偏黄？', type: 'single',
      options: [
        { value: 'cool', label: '冷调', sub: '偏粉、偏蓝，银饰更衬' },
        { value: 'neutral', label: '中性', sub: '不粉不黄，金饰银饰都能戴' },
        { value: 'warm', label: '暖调', sub: '偏黄、偏金，金饰更衬' },
        { value: 'unsure', label: '不确定', sub: '那就凭直觉，后面还有题' }
      ]
    },
    {
      id: 'metal', label: '首饰偏好', prompt: '戴哪种首饰，别人更容易夸你？',
      hint: '选你戴上后肤色更亮、更干净的那一种。', type: 'single',
      options: [
        { value: 'silver', label: '银色 / 白金', sub: '冷调感更强' },
        { value: 'gold', label: '金色 / 黄铜', sub: '暖调感更强' },
        { value: 'both', label: '两种都可以', sub: '中性底色' },
        { value: 'unsure', label: '没太注意', sub: '按直觉选' }
      ]
    },
    {
      id: 'hair', label: '自然发色', prompt: '你的头发在阳光下更接近？',
      hint: '看没有染过的发根或发尾。', type: 'single',
      options: [
        { value: 'black', label: '乌黑', sub: '偏冷、偏深' },
        { value: 'darkbrown', label: '深棕', sub: '自然黑茶' },
        { value: 'lightbrown', label: '浅棕 / 茶色', sub: '偏浅、偏暖' },
        { value: 'red', label: '红棕 / 铜色', sub: '明显暖调' },
        { value: 'gray', label: '灰 / 银', sub: '冷调、低饱和' }
      ]
    },
    {
      id: 'eyes', label: '瞳色', prompt: '你的眼睛在阳光下更像哪种颜色？',
      hint: '看虹膜边缘，不是美瞳。', type: 'single',
      options: [
        { value: 'dark', label: '深黑 / 深棕', sub: '对比强' },
        { value: 'deepbrown', label: '暖棕 / 琥珀', sub: '偏暖' },
        { value: 'hazel', label: '榛果 / 橄榄', sub: '带绿调' },
        { value: 'gray', label: '灰蓝 / 冷灰', sub: '偏冷' },
        { value: 'green', label: '绿色', sub: '清透' }
      ]
    },
    {
      id: 'palette', label: '被夸的颜色', prompt: '哪组颜色你穿上最常被夸？',
      hint: '选别人主动说“今天气色真好”的那组。', type: 'single',
      options: [
        { value: 'jewel', label: '宝石色', sub: '酒红 / 宝蓝 / 翡翠' },
        { value: 'earth', label: '大地色', sub: '驼 / 棕 / 橄榄' },
        { value: 'pastel', label: '马卡龙', sub: '粉 / 蓝 / 薄荷' },
        { value: 'bright', label: '高饱和亮色', sub: '正红 / 亮橙 / 亮黄' },
        { value: 'mono', label: '黑白灰', sub: '极简中性色' }
      ]
    },
    {
      id: 'contrast', label: '对比度', prompt: '你更适合哪种对比度？',
      hint: '看头发、眼睛和肤色的明暗差。', type: 'single',
      options: [
        { value: 'high', label: '高对比', sub: '深发 + 浅肤，黑白分明' },
        { value: 'medium', label: '中等', sub: '柔和的明暗过渡' },
        { value: 'low', label: '低对比', sub: '整体颜色很柔和' }
      ]
    },
    {
      id: 'feature', label: '五官量感', prompt: '你的五官量感更接近？',
      hint: '看五官在脸上的占比和立体度。', type: 'single',
      options: [
        { value: 'small', label: '小巧精致', sub: '五官秀气，留白多' },
        { value: 'medium', label: '适中', sub: '量感均衡' },
        { value: 'large', label: '立体大气', sub: '五官存在感强' }
      ]
    },
    {
      id: 'body', label: '身形', prompt: '你的身形更接近哪一种？',
      hint: '看肩宽、腰线和胯宽的比例。', type: 'single',
      options: [
        { value: 'X', label: 'X 型 / 沙漏', sub: '肩胯接近，腰线明显' },
        { value: 'H', label: 'H 型 / 直筒', sub: '肩胯腰宽度接近' },
        { value: 'A', label: 'A 型 / 梨形', sub: '胯比肩宽，下半身有量感' },
        { value: 'O', label: 'O 型 / 苹果', sub: '腰腹有肉，四肢较细' },
        { value: 'Y', label: 'Y 型 / 倒三角', sub: '肩比胯宽，上半身有量感' }
      ]
    },
    {
      id: 'goal', label: '优先目标', prompt: '现在最想先解决什么？',
      hint: '选一个最让你头疼的。', type: 'single',
      options: [
        { value: 'outfit', label: '每天穿什么', sub: '衣柜满的，但没衣服穿' },
        { value: 'makeup', label: '化妆配色', sub: '口红、眼影总是不对' },
        { value: 'hair', label: '发型方向', sub: '换了很多次，始终差点意思' },
        { value: 'color', label: '找到本命色', sub: '想显气色，不想盲目追白' },
        { value: 'confidence', label: '建立自信', sub: '不想再被评分和比较' }
      ]
    },
    {
      id: 'style', label: '风格偏好', prompt: '你更想成为哪种风格？',
      hint: '没有对错，选你看到会心动的那一个。', type: 'single',
      options: [
        { value: 'elegant', label: '温婉优雅', sub: '柔和、精致、有女人味' },
        { value: 'cool', label: '清冷知性', sub: '利落、克制、有距离感' },
        { value: 'sweet', label: '甜酷灵动', sub: '反差、短比例、有个性' },
        { value: 'natural', label: '自然松弛', sub: '舒服、呼吸感、不费力' },
        { value: 'retro', label: '复古文艺', sub: '浓郁、故事感、浪漫' },
        { value: 'minimal', label: '极简现代', sub: '单色、线条、建筑感' }
      ]
    }
  ];

  const warmMap = { cool: -1, neutral: 0, warm: 1, unsure: 0 };
  const metalMap = { silver: -0.8, gold: 0.8, both: 0, unsure: 0 };
  const hairWarm = { black: -0.6, darkbrown: 0.1, lightbrown: 0.6, red: 1, gray: -0.8 };
  const hairDepth = { black: 4, darkbrown: 3, lightbrown: 2, red: 3, gray: 2 };
  const eyeWarm = { dark: -0.3, deepbrown: 0.5, hazel: 0.6, gray: -0.8, green: 0.2 };
  const eyeDepth = { dark: 4, deepbrown: 3, hazel: 2.5, gray: 2, green: 2 };
  const paletteWarm = { jewel: -0.5, earth: 1, pastel: -0.3, bright: 0.4, mono: 0 };
  const paletteClarity = { jewel: 3, earth: 1.3, pastel: 1.6, bright: 3, mono: 2.4 };
  const contrastDepth = { high: 4, medium: 2.6, low: 1.6 };
  const contrastClarity = { high: 3, medium: 2, low: 1.1 };
  const featureClarity = { small: 1.1, medium: 2, large: 3 };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function analyze(answers) {
    const a = Object.assign({
      depth: 2, undertone: 'neutral', metal: 'both', hair: 'darkbrown',
      eyes: 'deepbrown', palette: 'earth', contrast: 'medium', feature: 'medium',
      body: 'H', goal: 'outfit', style: 'elegant'
    }, answers);

    const warm = clamp((
      warmMap[a.undertone] * 1.1 +
      metalMap[a.metal] * 0.8 +
      hairWarm[a.hair] * 0.9 +
      eyeWarm[a.eyes] * 0.6 +
      paletteWarm[a.palette] * 0.9
    ) / 4.3, -1, 1);

    const depth = (
      Number(a.depth) +
      hairDepth[a.hair] +
      eyeDepth[a.eyes] +
      contrastDepth[a.contrast]
    ) / 4;

    const clarity = (
      paletteClarity[a.palette] +
      contrastClarity[a.contrast] +
      featureClarity[a.feature]
    ) / 3;

    let seasonId;
    if (warm >= 0.2) {
      if (depth >= 3.35) seasonId = 'deep-autumn';
      else if (depth >= 2.9) seasonId = clarity >= 2.35 ? 'warm-autumn' : 'deep-autumn';
      else if (depth <= 2.2) seasonId = clarity >= 2.25 ? 'light-spring' : 'soft-autumn';
      else seasonId = clarity >= 2.45 ? 'clear-spring' : (clarity >= 2.05 ? 'warm-spring' : 'soft-autumn');
    } else if (warm <= -0.2) {
      if (depth >= 3.35) seasonId = clarity >= 2.4 ? 'clear-winter' : 'deep-winter';
      else if (depth >= 2.9) seasonId = clarity >= 2.25 ? 'cool-winter' : 'deep-winter';
      else if (depth <= 2.2) seasonId = clarity >= 2.35 ? 'light-summer' : 'soft-summer';
      else seasonId = clarity >= 2.4 ? 'clear-winter' : 'cool-summer';
    } else {
      if (depth >= 3.2) seasonId = clarity >= 2.35 ? 'clear-winter' : 'deep-winter';
      else if (depth <= 2.15) seasonId = 'light-summer';
      else seasonId = clarity >= 2.3 ? 'cool-winter' : 'soft-summer';
    }

    // A preference for light colours should not be overridden by one dark answer.
    if (a.palette === 'pastel' && depth < 3.2 && ['deep-winter', 'deep-autumn', 'clear-winter'].includes(seasonId)) {
      seasonId = warm > 0 ? 'light-spring' : 'light-summer';
    }

    const styleId = archetypes[a.style] ? a.style : 'elegant';
    const archetype = archetypes[styleId];
    const season = seasons[seasonId];
    const body = bodyTypes[a.body] || bodyTypes.H;
    const goal = goals[a.goal] || goals.outfit;

    const secondary = [];
    if (a.feature === 'large') secondary.push('大气量感');
    if (a.feature === 'small') secondary.push('精致量感');
    if (a.contrast === 'high') secondary.push('高对比');
    if (a.contrast === 'low') secondary.push('低对比');
    if (warm >= 0.2) secondary.push('暖调');
    if (warm <= -0.2) secondary.push('冷调');

    return {
      version: 2,
      answers: a,
      seasonId,
      styleId,
      scores: { warm: Number(warm.toFixed(2)), depth: Number(depth.toFixed(2)), clarity: Number(clarity.toFixed(2)) },
      season,
      archetype,
      body,
      goal,
      secondary: secondary.slice(0, 3)
    };
  }

  function paletteCss(palette, count) {
    return (palette || []).slice(0, count || palette.length)
      .map(function (c) { return '<span class="swatch" style="background:' + c[0] + '" title="' + c[1] + '"><i>' + c[1] + '</i></span>'; })
      .join('');
  }

  window.GLOW = {
    seasons: seasons,
    archetypes: archetypes,
    bodyTypes: bodyTypes,
    goals: goals,
    questions: questions,
    analyze: analyze,
    paletteCss: paletteCss
  };
})();
