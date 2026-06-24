import ConfiguratorShell from '@/components/configurator/ConfiguratorShell'

export default async function QuoteConfiguratorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Phase 9 wires this up to a real saved quote. Until then, the id in the
  // URL just stands in for the quote number so the shell has something to show.
  const quoteNumber = id === 'new' ? 'AVW-DRAFT' : id.toUpperCase()

  return <ConfiguratorShell quoteNumber={quoteNumber} revisionLabel="B1" />
}
