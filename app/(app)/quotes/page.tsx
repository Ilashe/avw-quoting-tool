import { getUserQuotes, getUserName } from '@/lib/actions/quotes'
import QuoteDashboard from '@/components/quotes/QuoteDashboard'

export default async function QuotesPage() {
  const [quotes, userName] = await Promise.all([getUserQuotes(), getUserName()])
  return <QuoteDashboard initialQuotes={quotes} userName={userName} />
}
