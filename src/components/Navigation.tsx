import { emit } from '../eventbus'
import { usePlayerStore } from '../store/playerStore'
import Button from './Button'
import NumberInput from './NumberInput'
import SmallNumberInput from './NumberInput'

const Navigation = () => {
  const { state, openModal, closeModal, updateDM } = usePlayerStore()
  const { modalOpen, hasRolled } = state

  const handleRoll = () => {
    closeModal()
    emit('spell:cast')
  }

  const rollLabel = modalOpen ? 'Roll for initiative' : hasRolled ? 'Reroll' : 'Roll for initiative'

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-(--z-navigation) flex h-30 flex-nowrap items-center justify-center gap-4">
      {!modalOpen && <Button label="Edit" handleClick={openModal} />}

      <Button label={rollLabel} handleClick={handleRoll} />

      <NumberInput
        value={state.dungeonMaster.modifier}
        label="DM Modifier"
        onChange={(v) => updateDM({ modifier: v })}
      />
    </nav>
  )
}

export default Navigation
