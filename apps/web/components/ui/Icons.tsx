import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof Icons
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = Icons[name] as React.ComponentType<LucideProps>

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent {...props} />
}