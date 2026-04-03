import { usePlayerStore } from "../store/playerStore";
import { Card } from "./Card";
import { PlayerCard } from "./PlayerCard";

export function PlayerSetup() {
  const { state, addPlayer, deletePlayer, updatePlayer, updateDM } =
    usePlayerStore();

  return (
    <div className="player-setup">
      {/* Dungeon Master card */}
      <PlayerCard
        key={state.dungeonMaster.id}
        player={state.dungeonMaster}
        canDelete={false}
        onUpdate={(data) => updateDM(data)}
        onDelete={() => {}}
      />

      {/* Player cards */}
      {state.players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          canDelete={state.players.length > 1}
          onUpdate={(data) => updatePlayer(player.id, data)}
          onDelete={() => deletePlayer(player.id)}
        />
      ))}

      {/* Add player card */}
      <Card centered onClick={addPlayer}>
        <h2 className="player-setup__add-label">Add player</h2>
      </Card>
    </div>
  );
}
