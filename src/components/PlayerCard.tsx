import { useEffect, useState } from 'react'

import { type Player } from '../types/player'
import { Card } from './Card'
import { FileInput } from './FileInput'
import { NumberInput } from './NumberInput'
import { TextInput } from './TextInput'

interface PlayerCardProps {
  player: Player
  canDelete: boolean
  onUpdate: (data: Partial<Player>) => void
  onDelete: () => void
}

export function PlayerCard({ player, canDelete, onUpdate, onDelete }: PlayerCardProps) {
  const [name, setName] = useState(player.name)
  const [modifier, setModifier] = useState(player.modifier)
  const [imgUrl, setImgUrl] = useState(player.imgUrl)

  // Keep local state in sync if the player prop changes from outside
  useEffect(() => {
    setName(player.name)
  }, [player.name])
  useEffect(() => {
    setModifier(player.modifier)
  }, [player.modifier])
  useEffect(() => {
    setImgUrl(player.imgUrl)
  }, [player.imgUrl])

  const commit = (patch: Partial<Player>) => {
    onUpdate(patch)
  }

  const handleName = (v: string) => {
    setName(v)
    commit({ name: v })
  }
  const handleModifier = (v: number) => {
    setModifier(v)
    commit({ modifier: v })
  }
  const handleImage = (v: string) => {
    setImgUrl(v)
    commit({ imgUrl: v })
  }

  const cardStyle = imgUrl
    ? {
        backgroundImage: `linear-gradient(to top, rgba(26,27,32,0.95) 30%, rgba(26,27,32,0.4)), url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <Card className={`player-card${player.type === 'dm' ? ' player-card--dm' : ''}`}>
      <div className="player-card__inner" style={cardStyle}>
        {canDelete && (
          <button
            className="button button--icon player-card__delete"
            type="button"
            onClick={onDelete}
            aria-label="Delete player"
          >
            ×
          </button>
        )}
        <div className="player-card__controls">
          <TextInput
            name="name"
            id={player.id}
            value={name}
            onChange={handleName}
            placeholder="Character name"
          />
          <NumberInput name="modifier" id={player.id} value={modifier} onChange={handleModifier} />
          <FileInput id={player.id} value={imgUrl} onChange={handleImage} />
        </div>
      </div>
    </Card>
  )
}
