import { emit } from '../eventbus'
import { usePlayerStore } from '../store/playerStore'
import { NumberInput } from './NumberInput'

export function Navigation() {
  const { state, openModal, closeModal, updateDM } = usePlayerStore()
  const { modalOpen, hasRolled } = state

  const handleRoll = () => {
    closeModal()
    emit('spell:cast')
  }

  const rollLabel = modalOpen ? 'Roll for initiative' : hasRolled ? 'Reroll' : 'Roll for initiative'

  return (
    <nav className="nav">
      {!modalOpen && (
        <button className="text-button" type="button" onClick={openModal}>
          Edit
        </button>
      )}

      <button className="text-button" type="button" onClick={handleRoll}>
        {rollLabel}
      </button>

      <NumberInput
        name="DM modifier"
        id={state.dungeonMaster.id}
        value={state.dungeonMaster.modifier}
        onChange={(v) => updateDM({ modifier: v })}
        small
      />
    </nav>
  )
}
