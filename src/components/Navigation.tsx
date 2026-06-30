import { emit } from '../eventbus'
import { usePlayerStore } from '../store/playerStore'
import Button from './Button'
import SmallNumberInput from './SmallNumberInput'

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

      <SmallNumberInput
        value={state.dungeonMaster.modifier}
        label="DM Modifier"
        onChange={(v) => updateDM({ modifier: v })}
        small
      />
    </nav>
  )
}

export default Navigation
