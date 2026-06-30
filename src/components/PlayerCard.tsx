import { useEffect, useState } from 'react'

import { type Player } from '../types/player'
import Button from './Button'
import Card from './Card'
import FileInput from './FileInput'
import SmallNumberInput from './SmallNumberInput'
import TextInput from './TextInput'

interface PlayerCardProps {
  player: Player
  canDelete: boolean
  onUpdate: (data: Partial<Player>) => void
  onDelete: () => void
}

const PlayerCard = ({ player, canDelete, onUpdate, onDelete }: PlayerCardProps) => {
  const [name, setName] = useState(player.name)
  const [modifier, setModifier] = useState(player.modifier)
  const [imgUrl, setImgUrl] = useState(player.imgUrl)

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
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <Card
      style={cardStyle}
      className="before:absolute before:bottom-0 before:left-0 before:z-0 before:h-1/2 before:w-full before:bg-[linear-gradient(to_top,black,transparent)] before:content-['']"
    >
      {canDelete && (
        <Button
          size="small"
          intent="primary"
          handleClick={onDelete}
          label="x"
          className="mb-auto self-end"
        />
      )}
      <TextInput
        name="name"
        id={player.id}
        value={name}
        onChange={handleName}
        placeholder="Character name"
      />
      <SmallNumberInput value={modifier} onChange={handleModifier} label="Modifier" />
      <FileInput id={player.id} value={imgUrl} onChange={handleImage} />
    </Card>
  )
}

export default PlayerCard
