import { cn } from '@/lib/utils'

interface ClientAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const colors = [
  'bg-[#2563EB]',
  'bg-[#16A34A]',
  'bg-[#D97706]',
  'bg-[#DC2626]',
  'bg-[#7C3AED]',
  'bg-[#0891B2]',
]

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

function getColorFromName(name: string): string {
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ClientAvatar({ name, size = 'md', className }: ClientAvatarProps) {
  const colorClass = getColorFromName(name)
  const initials = getInitials(name)

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
