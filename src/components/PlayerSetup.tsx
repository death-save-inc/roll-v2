import { usePlayerStore } from '../store/playerStore'
import Card from './Card'
import PlayerCard from './PlayerCard'

const PlayerSetup = () => {
  const { state, addPlayer, deletePlayer, updatePlayer, updateDM } = usePlayerStore()

  return (
    <div className="grid-rows-auto grid w-full grid-cols-8 gap-3 p-6">
      <PlayerCard
        key={state.dungeonMaster.id}
        player={state.dungeonMaster}
        canDelete={false}
        onUpdate={(data) => updateDM(data)}
        onDelete={() => {}}
      />

      {state.players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          canDelete={state.players.length > 1}
          onUpdate={(data) => updatePlayer(player.id, data)}
          onDelete={() => deletePlayer(player.id)}
        />
      ))}

      <Card centered onClick={addPlayer} className="cursor-pointer">
        <h2 className="m-6 text-center text-5xl text-primary">Add player</h2>
      </Card>
    </div>
  )
}

export default PlayerSetup
