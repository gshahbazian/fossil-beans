import PlayersList from '@/components/PlayersList'
import { Game, OnPlayerClicked } from '@/lib/types'

export default function GameEntry({
  game,
  onPlayerClicked,
}: {
  game: Game
  onPlayerClicked: OnPlayerClicked
}) {
  const homeScore = game.homeScore.reduce((acc, score) => acc + score.pts, 0)
  const visitorScore = game.visitorScore.reduce(
    (acc, score) => acc + score.pts,
    0
  )

  return (
    <div className="flex flex-col gap-8">
      <hr />

      <h2 className="text-2xl font-bold">
        {game.homeTeam}{' '}
        <span className="font-normal font-[family-name:var(--font-geist-mono)]">
          {homeScore}-{visitorScore}
        </span>{' '}
        {game.visitorTeam}
      </h2>
      <PlayersList scores={game.homeScore} onPlayerClicked={onPlayerClicked} />
      <PlayersList
        scores={game.visitorScore}
        onPlayerClicked={onPlayerClicked}
      />
    </div>
  )
}
