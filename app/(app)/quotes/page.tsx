import { getUserQuotes } from '@/lib/actions/quotes'
import QuoteDashboard from '@/components/quotes/QuoteDashboard'

export default async function QuotesPage() {
  const quotes = await getUserQuotes()
  return <QuoteDashboard initialQuotes={quotes} />
}
