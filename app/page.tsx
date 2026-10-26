import { redirect } from 'next/navigation'

// The old demo dashboard showed mock chores and points; Today now shows the household's real data.
export default function Home() {
  redirect('/today')
}
