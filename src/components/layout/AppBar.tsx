import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import Button from '@/components/ui/Button'
import { IconDownload, IconFile, IconFolderOpen, IconMenu, IconSave } from '@/components/ui/Icons'

interface AppBarProps {
  onCreateNew: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onExportPDF: () => void
  isExporting: boolean
}

function LogoMark() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brand text-white shadow-e1">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 3.5h7.2L18 7.8v12.7H6.5z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M13.4 3.6v4.4h4.4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.2 16.4l1.5-3.6 1.5 3.6M9.7 15.3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function AppBar({
  onCreateNew,
  onOpenFile,
  onSaveFile,
  onExportPDF,
  isExporting
}: AppBarProps) {
  const fileName = useResumeStore((s) => s.fileName)
  const toggleNav = useUIStore((s) => s.toggleNav)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-outline bg-surface px-3">
      {/* 左：导航开关 + 标志 */}
      <Button variant="icon" size="md" onClick={toggleNav} title="展开/收起导航" aria-label="展开或收起导航">
        <IconMenu size={20} />
      </Button>

      <div className="flex items-center gap-2.5 pr-3">
        <LogoMark />
        <div className="hidden leading-tight sm:block">
          <div className="text-[15px] font-medium tracking-tight text-ink">简历工坊</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-3">Resume Craft</div>
        </div>
      </div>

      {/* 中：文件名（Gmail 搜索栏位置的信息展示） */}
      <div className="mx-1 hidden min-w-0 flex-1 items-center gap-2 rounded-full bg-hover px-4 py-2 md:flex">
        <IconFile size={16} className="shrink-0 text-ink-3" />
        <span className="truncate text-sm text-ink-2">
          {fileName || '未命名简历'}
        </span>
        {!fileName && <span className="shrink-0 text-xs text-ink-3">· 尚未保存到文件</span>}
      </div>

      {/* 右：文件操作 + 导出 */}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="icon" size="md" onClick={onCreateNew} title="新建简历" aria-label="新建简历">
          <span className="text-lg leading-none">+</span>
        </Button>
        <Button variant="icon" size="md" onClick={onOpenFile} title="打开简历文件" aria-label="打开简历文件">
          <IconFolderOpen size={19} />
        </Button>
        <Button variant="icon" size="md" onClick={onSaveFile} title="保存简历" aria-label="保存简历">
          <IconSave size={19} />
        </Button>

        <div className="mx-2 h-6 w-px bg-outline" />

        <Button
          variant="filled"
          size="md"
          loading={isExporting}
          icon={isExporting ? undefined : <IconDownload size={18} />}
          onClick={onExportPDF}
          title="导出为 PDF 文件"
        >
          {isExporting ? '导出中…' : '导出 PDF'}
        </Button>
      </div>
    </header>
  )
}
