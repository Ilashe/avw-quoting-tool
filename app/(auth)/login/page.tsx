import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4">
      {/* Signature: concentric rings echo the seal in the AVW mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[34rem] rounded-full border border-brand/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[26rem] rounded-full border border-brand/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-[22rem] rounded-full border border-ink/5"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-ink/5 bg-white p-8 shadow-[0_24px_60px_-20px_rgba(15,42,77,0.25)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/avw-logo.png" alt="AVW Equipment Co." width={72} height={72} priority />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            AVW Equipment Co.
          </p>
          <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-ink">
            Quoting Tool
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to configure and price equipment quotes.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
