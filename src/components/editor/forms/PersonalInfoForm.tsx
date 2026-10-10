import { useCallback, useRef, useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import type { PersonalInfo } from '@/types/resume'
import { toast } from '@/store/toastStore'
import { TextField, ValidatedTextField } from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import {
  IconCamera,
  IconGithub,
  IconGlobe,
  IconLinkedin,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTrash,
  IconUser
} from '@/components/ui/Icons'
import { fileToSquareDataUrl } from '@/utils/image'
import {
  checkEmail,
  checkGithub,
  checkLinkedin,
  checkPhone,
  checkUrl,
  type FieldCheck
} from '@/utils/validators'

interface FieldDef {
  key: keyof PersonalInfo
  label: string
  placeholder: string
  icon?: React.ReactNode
  /** 有 validate 的字段会在失焦后就地校验 */
  validate?: (v: string) => FieldCheck
}

const FIELDS: FieldDef[] = [
  { key: 'fullName', label: '姓名', placeholder: '你的全名', icon: <IconUser size={16} /> },
  { key: 'title', label: '求职意向', placeholder: '如：前端开发工程师' },
  {
    key: 'email',
    label: '邮箱',
    placeholder: 'example@email.com',
    icon: <IconMail size={16} />,
    validate: checkEmail
  },
  {
    key: 'phone',
    label: '电话',
    placeholder: '手机号码或带区号的固话',
    icon: <IconPhone size={16} />,
    validate: checkPhone
  },
  { key: 'location', label: '所在地（选填）', placeholder: '如：北京', icon: <IconMapPin size={16} /> },
  {
    key: 'website',
    label: '个人网站（选填）',
    placeholder: 'https://example.dev',
    icon: <IconGlobe size={16} />,
    validate: (v) => checkUrl(v, '个人网站')
  },
  {
    key: 'github',
    label: 'GitHub（选填）',
    placeholder: '用户名或主页链接',
    icon: <IconGithub size={16} />,
    validate: checkGithub
  },
  {
    key: 'linkedin',
    label: 'LinkedIn（选填）',
    placeholder: '用户名或链接',
    icon: <IconLinkedin size={16} />,
    validate: checkLinkedin
  }
]

function AvatarUploader() {
  const avatar = useResumeStore((s) => s.data.personalInfo.avatar)
  const update = useResumeStore((s) => s.updatePersonalInfo)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setIsProcessing(true)
      try {
        const dataUrl = await fileToSquareDataUrl(file)
        update({ avatar: dataUrl })
        toast.success('头像已更新')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '头像处理失败')
      } finally {
        setIsProcessing(false)
      }
    },
    [update]
  )

  return (
    <div className="flex items-center gap-4">
      {/* 预览 / 拖放区 */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          void handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        title="点击或拖入图片设置头像"
        className={`group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]
          ${isDragging ? 'scale-105 border-brand bg-brand-soft' : 'border-outline hover:border-brand hover:bg-brand-soft'}
          ${avatar ? 'border-solid border-outline' : ''}`}
      >
        {avatar ? (
          <>
            <img src={avatar} alt="头像预览" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <IconCamera size={20} />
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1 text-ink-3">
            <IconCamera size={20} />
            <span className="text-[10px]">上传头像</span>
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">头像</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-3">
          {isProcessing ? '正在处理图片…' : '点击或拖入图片，会自动裁成正方形并压缩'}
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outlined"
            size="sm"
            loading={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            {avatar ? '更换' : '选择图片'}
          </Button>
          {avatar && (
            <Button
              variant="text"
              size="sm"
              icon={<IconTrash size={15} />}
              onClick={() => {
                update({ avatar: undefined })
                toast.info('已移除头像')
              }}
            >
              移除
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-3">
          提示：国内互联网岗位通常不放照片，国企/银行岗位更常见
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = '' // 允许重复选择同一文件
        }}
      />
    </div>
  )
}

export default function PersonalInfoForm() {
  const info = useResumeStore((s) => s.data.personalInfo)
  const update = useResumeStore((s) => s.updatePersonalInfo)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-ink">个人信息</h2>
        <p className="mt-1 text-sm text-ink-2">
          填写基本信息与求职意向，让 HR 一眼了解你。
          <span className="text-ink-3">标注「选填」的可以留空。</span>
        </p>
      </div>

      <AvatarUploader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const value = String(info[f.key] ?? '')
          const shared = {
            label: f.label,
            placeholder: f.placeholder,
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              update({ [f.key]: e.target.value }),
            addon: f.icon,
            className: f.key === 'fullName' || f.key === 'title' ? 'sm:col-span-2' : ''
          }

          return f.validate ? (
            <ValidatedTextField key={f.key} {...shared} validate={f.validate} />
          ) : (
            <TextField key={f.key} {...shared} />
          )
        })}
      </div>
    </div>
  )
}
