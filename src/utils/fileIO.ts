import type { ResumeData } from '@/types/resume'

/**
 * 保存简历数据到 JSON 文件（通过 Electron IPC）
 */
export async function saveToFile(
  data: ResumeData,
  fileName?: string
): Promise<{ success: boolean; filePath?: string }> {
  if (!window.electronAPI) {
    // 浏览器回退：下载 JSON 文件
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || '我的简历.json'
    a.click()
    URL.revokeObjectURL(url)
    return { success: true }
  }

  const json = JSON.stringify(data, null, 2)
  return window.electronAPI.saveFile(json)
}

/**
 * 从 JSON 文件加载简历数据（通过 Electron IPC）
 */
export async function loadFromFile(): Promise<{
  success: boolean
  data?: ResumeData
  filePath?: string
}> {
  if (!window.electronAPI) {
    return { success: false }
  }

  const result = await window.electronAPI.openFile()
  if (result.success && result.data) {
    try {
      const data = JSON.parse(result.data) as ResumeData
      // 简单验证数据结构
      if (!data.meta || !data.personalInfo) {
        return { success: false }
      }
      return { success: true, data, filePath: result.filePath }
    } catch {
      return { success: false }
    }
  }
  return { success: false }
}
