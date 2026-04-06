import fs from 'fs'
import path from 'path'

// 读取文件
export const readFile = (filePath, defaultValue = {}) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim()
      return content ? JSON.parse(content) : defaultValue
    }
  } catch (e) {
    console.error('文件读取失败：', e)
  }
  return defaultValue
}

// 写入文件
export const writeFile = (filePath, data) => {
  try {
    // 自动创建目录
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (e) {
    console.error('文件写入失败：', e)
    return false
  }
}