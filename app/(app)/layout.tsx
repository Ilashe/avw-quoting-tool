import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex shrink-0 items-center justify-between bg-ink px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <Image src="/avw-logo.png" alt="AVW Equipment Co." width={32} height={32} />
          <div className="leading-tight">
            <p className="font-display text-lg uppercase tracking-wide">AVW</p>
            <p className="text-[11px] text-slate-300">Quoting Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-mist text-xs font-semibold text-ink ring-2 ring-brand/40">
              {initials}
            </span>
            <div className="leading-tight">
              <p className="text-white">{displayName}</p>
              <p className="text-[11px] capitalize text-slate-300">{profile?.role ?? 'salesperson'}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand hover:border-brand"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
