import type { ComponentType } from 'react'

export interface GameDefinition {
  /** URL や key に使う一意な識別子 */
  id: string
  title: string
  description: string
  /** 一覧カードに表示する絵文字アイコン */
  icon: string
  component: ComponentType
}
