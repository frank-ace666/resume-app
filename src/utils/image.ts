const MAX_FILE_BYTES = 8 * 1024 * 1024 // 8MB
const OUTPUT_SIZE = 256

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片解析失败'))
    img.src = src
  })
}

/**
 * 读入图片并居中裁成正方形，等比缩放后输出小尺寸 JPEG。
 *
 * 直接存原图会带来两个问题：非正方形图片在模板里会被拉变形，
 * 且 base64 会撑大 localStorage 存档。这里统一裁成正方形并压到 256px，
 * 避免为裁剪再引入一个第三方库。
 */
export async function fileToSquareDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('图片过大，请选择 8MB 以内的图片')
  }

  const dataUrl = await readAsDataURL(file)
  const img = await loadImage(dataUrl)

  if (!img.width || !img.height) {
    throw new Error('图片尺寸无效')
  }

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 canvas 上下文')

  // cover：短边铺满，长边居中裁掉
  const scale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height)
  const w = img.width * scale
  const h = img.height * scale

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  ctx.drawImage(img, (OUTPUT_SIZE - w) / 2, (OUTPUT_SIZE - h) / 2, w, h)

  return canvas.toDataURL('image/jpeg', 0.9)
}
