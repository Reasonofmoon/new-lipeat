import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  SkipBack,
  SkipForward,
  Square,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Type,
  Languages,
  Layers,
} from "lucide-react"

interface KeyboardShortcutProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  key: string
  description: string
  icon?: React.ReactNode
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutProps> = ({ isOpen, onClose }) => {
  const shortcuts: ShortcutItem[] = [
    { key: "SPACE", description: "재생/일시정지", icon: <Play className="w-4 h-4" /> },
    { key: "←", description: "선택된 문장 시작 지점에서 재생", icon: <ArrowLeft className="w-4 h-4" /> },
    { key: "↑", description: "위 문장으로 이동 후 재생", icon: <ArrowUp className="w-4 h-4" /> },
    { key: "↓", description: "아래 문장으로 이동 후 재생", icon: <ArrowDown className="w-4 h-4" /> },
    { key: "C", description: "선택된 문장 표시 on/off", icon: <Type className="w-4 h-4" /> },
    { key: "S", description: "자막 보이기 on/off", icon: <Type className="w-4 h-4" /> },
    { key: "L", description: "번역 및 설명 on/off", icon: <Languages className="w-4 h-4" /> },
    { key: "V", description: "학습 모드 설정", icon: <Layers className="w-4 h-4" /> },
    { key: "[", description: "구간 반복 시작 설정", icon: <SkipBack className="w-4 h-4" /> },
    { key: "]", description: "구간 반복 종료 설정", icon: <SkipForward className="w-4 h-4" /> },
    { key: "\\", description: "구간 반복 해제", icon: <Square className="w-4 h-4" /> },
    { key: "+", description: "글자 크기 크게", icon: <Plus className="w-4 h-4" /> },
    { key: "-", description: "글자 크기 작게", icon: <Minus className="w-4 h-4" /> },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>키보드 단축키</DialogTitle>
          <DialogDescription>학습 과정을 더 효율적으로 제어할 수 있는 단축키입니다.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  {shortcut.icon && <span className="mr-2 text-primary">{shortcut.icon}</span>}
                  <span>{shortcut.description}</span>
                </div>
                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsModal

