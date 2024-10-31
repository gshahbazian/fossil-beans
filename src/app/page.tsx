import PlayersList from '@/components/PlayersList'

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center p-4 pb-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2">
        <h1 className="text-4xl font-bold text-center">Fossil Beans</h1>

        <h2 className="text-2xl font-bold">Top Performers - 10/30</h2>
        <PlayersList />

        <hr />

        <h2 className="text-2xl font-bold">
          Boston{' '}
          <span className="font-normal font-[family-name:var(--font-geist-mono)]">
            132-135
          </span>{' '}
          Indiana
        </h2>
        <PlayersList />
      </main>
    </div>
  )
}
