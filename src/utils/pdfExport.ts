import { html2canvas } from 'html2pdf-browser'
import { jsPDF } from 'jspdf'

/**
 * 为什么不用 html2pdf-browser 的 html2pdf() 一步到位？
 *
 * 该库内部把图片按 `el.offsetWidth / el.offsetHeight` 放进页面，单位跟随
 * jsPDF 的 unit：
 *     b = el.offsetWidth; w = el.offsetHeight
 *     pdf.addImage(dataURL, 'JPEG', 0, 0, b, w)
 *
 * 而 210mm 宽的元素在 CSS 里是 793.7px，jsPDF 又没有任何一种 unit 等于 1 CSS px
 * （实测 A4 宽度：pt=595.28 / mm=210 / px=446.46），
 * 所以无论 unit 传什么，图片都会被画得比 A4 宽 —— 实测溢出 3.78 倍，
 * 导出结果只剩简历左上角，且长简历会被压在一页里截断。
 *
 * 因此这里保留该库真正有价值的部分（它导出的 html2canvas 带中文
 * 字间距与 SVG <use href> 渲染修复），页面尺寸与分页由我们自己控制。
 */

const CSS_PX_PER_MM = 96 / 25.4
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

/** 光栅化倍率。2 ≈ 192dpi，A4 下文字清晰且文件大小可控。 */
const CAPTURE_SCALE = 2

const JPEG_QUALITY = 0.95

/** 捕获期间用来冻结动画/过渡的标记类 */
const STABILIZE_CLASS = 'pdf-capture-stabilize'
const STABILIZE_STYLE_ID = 'pdf-capture-stabilize-style'

function ensureStabilizeStyle(): void {
  if (document.getElementById(STABILIZE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STABILIZE_STYLE_ID
  // 捕获时若还有动画在跑，栅格化结果会不确定（评分环、进入动画等）
  style.textContent = `.${STABILIZE_CLASS} *, .${STABILIZE_CLASS} *::before, .${STABILIZE_CLASS} *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }`
  document.head.appendChild(style)
}

/** 捕获期间冻结布局状态，结束后恢复 */
async function withStabilizedLayout<T>(element: HTMLElement, fn: () => Promise<T>): Promise<T> {
  ensureStabilizeStyle()
  element.classList.add(STABILIZE_CLASS)
  // 等一帧，确保样式已应用
  await new Promise((r) => requestAnimationFrame(() => r(null)))
  try {
    return await fn()
  } finally {
    element.classList.remove(STABILIZE_CLASS)
  }
}

/**
 * 把简历节点光栅化后按 A4 分页写入 PDF。
 * 内容不足一页时补足一页；超过一页时按页高切片，不再截断。
 */
async function buildPdf(element: HTMLElement): Promise<jsPDF> {
  const canvas = await html2canvas(element, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

  if (!canvas.width || !canvas.height) {
    throw new Error('简历内容为空，无法生成 PDF')
  }

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  })

  // canvas 像素 → 毫米。用元素实际布局宽度换算，不依赖缩放倍率，
  // 因此导出结果与预览区当前的缩放级别无关。
  const elementWidthPx = element.offsetWidth || canvas.width / CAPTURE_SCALE
  const elementWidthMm = elementWidthPx / CSS_PX_PER_MM
  const pxPerMm = canvas.width / elementWidthMm

  const pageHeightPx = A4_HEIGHT_MM * pxPerMm
  // 减 1px 容差：元素高度恰为 297mm 时避免因浮点误差多出一张空白页
  const pageCount = Math.max(1, Math.ceil((canvas.height - 1) / pageHeightPx))

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage()

    const sliceTop = page * pageHeightPx
    const sliceHeight = Math.min(pageHeightPx, canvas.height - sliceTop)

    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.max(1, Math.round(sliceHeight))

    const ctx = slice.getContext('2d')
    if (!ctx) throw new Error('无法创建 canvas 上下文')

    // 先铺白底，避免 JPEG 把透明区域压成黑色
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(
      canvas,
      0,
      sliceTop,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      slice.height
    )

    const imageData = slice.toDataURL('image/jpeg', JPEG_QUALITY)
    // 最后一页不足整页时按实际高度绘制，避免被拉伸变形
    pdf.addImage(imageData, 'JPEG', 0, 0, A4_WIDTH_MM, slice.height / pxPerMm)
  }

  return pdf
}

/** 生成 PDF Blob（浏览器环境可直接下载，Electron 下交给 IPC 落盘） */
export async function generatePDFBlob(
  element: HTMLElement,
  _filename: string = '我的简历'
): Promise<Blob | null> {
  try {
    return await withStabilizedLayout(element, async () => {
      const pdf = await buildPdf(element)
      return pdf.output('blob') as Blob
    })
  } catch (err) {
    console.error('PDF 生成失败:', err)
    return null
  }
}

/**
 * 导出 PDF。签名与既有实现保持一致，调用方（usePdfExport / Electron IPC）无需改动。
 */
export async function exportPDF(
  element: HTMLElement,
  filename: string = '我的简历'
): Promise<boolean> {
  try {
    const blob = await generatePDFBlob(element, filename)
    if (!blob) return false

    // 通过 Electron IPC 保存
    if (window.electronAPI) {
      const arrayBuffer = await blob.arrayBuffer()
      const dialogResult = await window.electronAPI.exportPDFDialog()
      if (dialogResult.success && dialogResult.filePath) {
        const writeResult = await window.electronAPI.writePDF(dialogResult.filePath, arrayBuffer)
        return Boolean(writeResult?.success)
      }
      return false // 用户取消
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
