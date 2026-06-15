import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'escape-room.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDb(): void {
  const database = getDb()

  database.exec(`
    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cover TEXT NOT NULL,
      difficulty INTEGER NOT NULL CHECK(difficulty BETWEEN 1 AND 5),
      min_players INTEGER NOT NULL,
      max_players INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      description TEXT DEFAULT '',
      story TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      theme_id INTEGER NOT NULL REFERENCES themes(id),
      cleaning_status TEXT NOT NULL DEFAULT 'clean' CHECK(cleaning_status IN ('clean', 'dirty'))
    );

    CREATE TABLE IF NOT EXISTS npcs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'assigned', 'off'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme_id INTEGER NOT NULL REFERENCES themes(id),
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'booked', 'in_progress', 'completed', 'cancelled')),
      npc_id INTEGER REFERENCES npcs(id),
      current_bookings INTEGER NOT NULL DEFAULT 0,
      max_players INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      player_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      player_count INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'no_show')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      name TEXT NOT NULL,
      condition TEXT NOT NULL DEFAULT 'normal' CHECK(condition IN ('normal', 'damaged'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
    CREATE INDEX IF NOT EXISTS idx_sessions_theme ON sessions(theme_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_npc ON sessions(npc_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
    CREATE INDEX IF NOT EXISTS idx_prop_items_room ON prop_items(room_id);
  `)
}

export function seedDb(): void {
  const database = getDb()

  const themeCount = database.prepare('SELECT COUNT(*) as count FROM themes').get() as { count: number }
  if (themeCount.count > 0) return

  const insertTheme = database.prepare(`
    INSERT INTO themes (name, cover, difficulty, min_players, max_players, duration, description, story)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertRoom = database.prepare(`
    INSERT INTO rooms (name, theme_id, cleaning_status)
    VALUES (?, ?, ?)
  `)

  const insertNpc = database.prepare(`
    INSERT INTO npcs (name, avatar, skills, status)
    VALUES (?, ?, ?, ?)
  `)

  const insertPropItem = database.prepare(`
    INSERT INTO prop_items (room_id, name, condition)
    VALUES (?, ?, ?)
  `)

  const themes = [
    {
      name: '暗影古堡',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20gothic%20castle%20interior%20with%20candlelight%2C%20stone%20walls%2C%20mysterious%20atmosphere%2C%20cinematic%20lighting&image_size=landscape_16_9',
      difficulty: 4,
      minPlayers: 2,
      maxPlayers: 6,
      duration: 90,
      description: '中世纪古堡中的黑暗秘密，你能在天亮前逃出生天吗？',
      story: '你收到了一封来自远方亲戚的遗产继承信，当你抵达这座百年古堡时，发现大门在你身后缓缓关闭...古堡中隐藏着不为人知的秘密，你需要解开先祖留下的谜题，才能在黎明前找到出口。'
    },
    {
      name: '量子实验室',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20science%20laboratory%20with%20neon%20blue%20lights%2C%20quantum%20equipment%2C%20holographic%20displays%2C%20sci-fi%20atmosphere&image_size=landscape_16_9',
      difficulty: 5,
      minPlayers: 3,
      maxPlayers: 8,
      duration: 120,
      description: '失控的量子实验撕裂了时空，你需要修复裂隙才能回家。',
      story: '公元2147年，量子物理实验室发生严重事故，时空裂隙正在扩大。你作为紧急救援小队，必须在平行维度吞噬一切之前，找到稳定量子场的密码，关闭裂隙装置。时间紧迫，每一次选择都可能改变现实。'
    },
    {
      name: '幽灵列车',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=creepy%20abandoned%20train%20at%20night%2C%20fog%2C%20ghostly%20green%20light%2C%20horror%20atmosphere%2C%20rain&image_size=landscape_16_9',
      difficulty: 3,
      minPlayers: 2,
      maxPlayers: 5,
      duration: 75,
      description: '午夜列车上发生了离奇失踪案，真相藏在车厢的暗处。',
      story: '你登上了午夜12点的末班列车，车厢里只有你和几名乘客。当列车驶入隧道后，灯光突然熄灭...恢复时，一名乘客消失了。你需要调查每节车厢的线索，揭开幽灵列车的真相。'
    },
    {
      name: '末日避难所',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=post-apocalyptic%20underground%20bunker%2C%20survival%20supplies%2C%20dim%20emergency%20lights%2C%20gritty%20industrial%20atmosphere&image_size=landscape_16_9',
      difficulty: 2,
      minPlayers: 4,
      maxPlayers: 10,
      duration: 60,
      description: '核战后的地下避难所，资源即将耗尽，你们能找到出路吗？',
      story: '核战争爆发后的第365天，你们的地下避难所氧气循环系统出现故障。外面的辐射水平依然致命，但避难所的物资只能再维持24小时。你们必须启动古老的逃生通道，但每一步都充满未知危险。'
    },
    {
      name: '盗梦空间',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=surreal%20dreamscape%20with%20floating%20buildings%20and%20distorted%20perspective%2C%20purple%20and%20gold%20colors%2C%20mind-bending%20architecture&image_size=landscape_16_9',
      difficulty: 5,
      minPlayers: 2,
      maxPlayers: 6,
      duration: 100,
      description: '被困在层层梦境中，你能否分辨现实与虚幻？',
      story: '你是一名梦境潜入者，在执行任务时被困在了目标的潜意识深处。现实与梦境的界限越来越模糊，你需要通过层层梦境外逃。但每一层梦境都有自己的规则，而你的记忆正在被侵蚀...醒来的方式只有一个——在每一层找到属于自己的图腾。'
    },
    {
      name: '海盗宝藏',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pirate%20ship%20cabin%20with%20treasure%20maps%20and%20gold%20coins%2C%20wooden%20barrels%2C%20warm%20lantern%20light%2C%20adventure%20atmosphere&image_size=landscape_16_9',
      difficulty: 1,
      minPlayers: 2,
      maxPlayers: 8,
      duration: 45,
      description: '老船长留下的藏宝图指向神秘岛屿，宝藏等你来寻！',
      story: '传说中海盗王黑胡子在临死前将毕生宝藏藏在了骷髅岛的深处。你意外获得了一张残破的藏宝图，踏上了寻宝之旅。岛上机关重重，还有其他寻宝者虎视眈眈。只有最聪明最勇敢的人，才能找到传说中的宝藏。'
    }
  ]

  const transaction = database.transaction(() => {
    for (const theme of themes) {
      const result = insertTheme.run(
        theme.name, theme.cover, theme.difficulty, theme.minPlayers,
        theme.maxPlayers, theme.duration, theme.description, theme.story
      )
      const themeId = result.lastInsertRowid as number

      const roomId = (insertRoom.run(`${theme.name}-A厅`, themeId, 'clean')).lastInsertRowid as number

      const props = ['钥匙', '密码锁', '手电筒', '对讲机', '线索卡片']
      for (const prop of props) {
        insertPropItem.run(roomId, prop, Math.random() > 0.8 ? 'damaged' : 'normal')
      }
    }

    const npcs = [
      { name: '张影', avatar: '', skills: ['恐怖氛围', '表演'], status: 'available' },
      { name: '李默', avatar: '', skills: ['逻辑推理', '机关'], status: 'available' },
      { name: '王灵', avatar: '', skills: ['剧情引导', '即兴'], status: 'available' },
      { name: '赵夜', avatar: '', skills: ['惊吓', '密室机关'], status: 'available' },
      { name: '陈幽', avatar: '', skills: ['解谜提示', '角色扮演'], status: 'available' },
      { name: '刘暗', avatar: '', skills: ['特效操控', '氛围营造'], status: 'off' }
    ]

    for (const npc of npcs) {
      insertNpc.run(npc.name, npc.avatar, JSON.stringify(npc.skills), npc.status)
    }
  })

  transaction()
}
