import { html2pdf } from 'html2pdf-browser'

export async function generatePDFBlob(
  element: HTMLElement,
  filename: string = '我的简历'
): Promise<Blob | null> {
  try {
    // 使用 download: false 获得 jsPDF 实例而非自动下载
    const pdf = await html2pdf(filename, element, {
      download: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      html2canvasOptions: {
        scale: 2,
        useCORS: true,
        logging: false
      } as any,
      jsPDFOptions: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    })

    if (pdf && typeof pdf.output === 'function') {
      return pdf.output('blob') as Blob
    }

    return null
  } catch (err) {
    console.error('PDF 生成失败:', err)
    return null
  }
}

export async function exportPDF(element: HTMLElement, filename: string = '我的简历'): Promise<boolean> {
  try {
    const blob = await generatePDFBlob(element, filename)
    if (!blob) return false

    // 通过 Electron IPC 保存
    if (window.electronAPI) {
      const arrayBuffer = await blob.arrayBuffer()
      const dialogResult = await window.electronAPI.exportPDFDialog()
      if (dialogResult.success && dialogResult.filePath) {
        await window.electronAPI.writePDF(dialogResult.filePath, arrayBuffer)
        return true
      }
    }

    // 浏览器回退：直接触发下载
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('PDF 导出失败:', err)
    return false
  }
}
