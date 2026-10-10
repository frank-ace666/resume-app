/**
 * 字段级格式校验 —— 单一事实来源。
 *
 * 为什么单独抽出来：`resumeChecker.ts` 里的「格式检查」规则早已有邮箱 / 手机 /
 * URL 的正则，但那些只在用户点「开始检查」时才跑。如果表单就地校验再各写一套
 * 正则，两处早晚会跑偏（改了这边忘了那边，用户看到互相矛盾的结果）。
 *
 * 所以：**谓词（isXxx）在这里，两处共用**；提示文案各自写
 * —— 就地校验要短，检查报告要解释清楚为什么、怎么改。
 */

export interface FieldCheck {
  ok: boolean
  message?: string
}

const OK: FieldCheck = { ok: true }
const fail = (message: string): FieldCheck => ({ ok: false, message })

/* ============================================================
   谓词（与 resumeChecker 共用）
   ============================================================ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_REGEX = /^1[3-9]\d{9}$/
/** 固定电话：区号 3–4 位 + 号码 7–8 位，允许连字符 */
const LANDLINE_REGEX = /^0\d{2,3}-?\d{7,8}$/
const URL_REGEX = /^https?:\/\/.+\..+/
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9\-_]+$/
const CJK_REGEX = /[一-龥　-〿＀-￯]/

/** 去掉用户习惯输入的空白与连字符后再判断 */
export function normalizePhone(v: string): string {
  return v.trim().replace(/[\s-]/g, '')
}

export const isEmail = (v: string) => EMAIL_REGEX.test(v.trim())
export const isMobile = (v: string) => MOBILE_REGEX.test(normalizePhone(v))
export const isLandline = (v: string) => LANDLINE_REGEX.test(normalizePhone(v))
export const isUrl = (v: string) => URL_REGEX.test(v.trim())
export const isGithubUsername = (v: string) => GITHUB_USERNAME_REGEX.test(v.trim())

/** 是否含中日韩文字/全角符号 —— 用来分辨「电话里填了人名」这类错误 */
export const hasCjk = (v: string) => CJK_REGEX.test(v)

/**
 * GitHub 字段既接受用户名也接受完整链接（模板渲染时会自动补 `github.com/`）。
 * 因此先剥掉常见前缀再判断。
 */
export function normalizeGithub(v: string): string {
  return v
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/\/+$/, '')
}

/* ============================================================
   字段校验（给表单用，空值一律放过）
   ------------------------------------------------------------
   空值不报错是刻意的：这是简历编辑器，用户可能正填到一半。
   「必填」是简历检查模块的职责，不是输入框的职责。
   ============================================================ */

export function checkEmail(value: string): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (hasCjk(v)) return fail('邮箱里不应出现中文，请检查是否填错字段')
  if (!isEmail(v)) return fail('邮箱格式不正确，应形如 name@example.com')
  return OK
}

export function checkPhone(value: string): FieldCheck {
  const v = value.trim()
  if (!v) return OK

  if (hasCjk(v)) return fail('这里要填电话号码，不是姓名')
  if (/[a-zA-Z]/.test(v)) return fail('电话号码不应包含字母')

  const digits = normalizePhone(v).replace(/[^\d]/g, '')
  if (digits.length < 7) return fail('号码太短，请填写完整电话')

  if (isMobile(v) || isLandline(v)) return OK

  if (/^1/.test(normalizePhone(v))) return fail('手机号应为 11 位数字，且以 1 开头')
  return fail('请填写 11 位手机号，或带区号的固定电话（如 010-12345678）')
}

export function checkUrl(value: string, label = '网址'): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (hasCjk(v)) return fail(`${label}里不应出现中文`)
  if (!/^https?:\/\//i.test(v)) return fail(`${label}需以 https:// 或 http:// 开头`)
  if (!isUrl(v)) return fail(`${label}格式不正确，请检查域名部分`)
  return OK
}

/**
 * 项目链接：比 checkUrl 宽松 —— 允许省略协议（用户常直接粘 `github.com/x/y`）。
 * 但仍要拦住明显不对的内容：中文、空格、以及既不是域名也不是路径的串。
 */
export function checkLink(value: string, label = '链接'): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (hasCjk(v)) return fail(`${label}里不应出现中文`)
  if (/\s/.test(v)) return fail(`${label}不应包含空格`)

  if (/^https?:\/\//i.test(v)) {
    return isUrl(v) ? OK : fail(`${label}格式不正确，请检查域名部分`)
  }
  if (!/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v)) {
    return fail(`${label}格式不正确，建议以 https:// 开头`)
  }
  return OK
}

export function checkGithub(value: string): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (hasCjk(v)) return fail('GitHub 用户名不应包含中文')
  const name = normalizeGithub(v)
  if (!name) return fail('请填写 GitHub 用户名或主页链接')
  if (!isGithubUsername(name)) {
    return fail('GitHub 用户名只能包含字母、数字、连字符和下划线')
  }
  return OK
}

export function checkLinkedin(value: string): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (hasCjk(v)) return fail('LinkedIn 链接里不应出现中文')
  // 允许只填用户名/短链，填了协议就按 URL 校验
  if (/^https?:\/\//i.test(v)) return checkUrl(v, 'LinkedIn 链接')
  if (!/^[a-zA-Z0-9\-_/]+$/.test(v)) return fail('LinkedIn 链接格式不正确')
  return OK
}

/** GPA 允许 3.8、3.8/4.0、88/100、4.2 等形式 */
export function checkGpa(value: string): FieldCheck {
  const v = value.trim()
  if (!v) return OK
  if (!/^\d{1,3}(\.\d{1,2})?(\s*\/\s*\d{1,3}(\.\d{1,2})?)?$/.test(v)) {
    return fail('GPA 应形如 3.8、3.8/4.0 或 88/100')
  }
  const [a, b] = v.split('/').map((x) => parseFloat(x))
  if (b !== undefined && a > b) return fail('GPA 不应大于满分')
  return OK
}

/**
 * 起止时间顺序。用 `YYYY-MM` 字符串直接比大小即可（同格式下字典序等于时间序）。
 */
export function checkDateRange(
  start: string,
  end: string,
  opts: { isCurrent?: boolean } = {}
): FieldCheck {
  const s = start.trim()
  const e = end.trim()
  if (!s || !e) return OK
  if (opts.isCurrent) return OK
  if (e < s) return fail('结束时间不能早于开始时间')
  return OK
}
