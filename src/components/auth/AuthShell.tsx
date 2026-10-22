import Image from 'next/image'
import { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle: string
  image: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, image, children }: AuthShellProps) {
  return (
    <main className="container mx-auto grid gap-12 px-4 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl bg-muted lg:block">
        <Image src={image} alt="" fill sizes="50vw" className="object-cover" />
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 mb-10 text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </main>
  )
}
