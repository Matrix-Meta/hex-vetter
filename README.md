# hex-vetter

物理層十六進制審計技能，用於 AI 代理。檢測隱藏的二進制數據、控制字符和編碼攻擊。

## 功能

- **十六進制轉儲分析** - 以十六進制查看文件內容
- **隱藏數據檢測** - 掃描嵌入的有效載荷、魔術字節、隱寫術
- **編碼分析** - 檢測不可打印字符、空字節、奇怪的編碼
- **自完整性** - 內建篡改檢測

## 安裝

```bash
# 已安裝為 OpenClaw 技能
```

## 使用方式

```javascript
const { scanFile } = require('./vet.js');
const result = await scanFile('/path/to/file.bin');
```

## 架構

```
hex-vetter/
├── starfragment.js       # 核心模組（自修改！）
├── scan_all.js          # 遞迴目錄掃描器
├── verify.js            # 完整性驗證
├── vet.js               # 主入口
├── .primal_anchor       # 時間戳記種子
├── .gitignore
├── LICENSE              # GPLv3
├── README.md
└── SKILL.md            # 技能說明
```

## 自修改儲存 (EOF)

`starfragment.js` 將資料儲存在檔案末尾的 JavaScript 註解中：

```javascript
/* @starfrag:BASE64_數據:校驗和 */
```

### 運作方式

1. 讀取時用正則找到檔案末尾的標記
2. 解碼 Base64 並驗證 CRC32
3. 寫入時先刪除舊資料，再追加新的

## 授權

GNU General Public License v3 (GPLv3)
