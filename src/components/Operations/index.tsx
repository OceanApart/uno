import cx from 'classnames'
import { Button, message, Popover } from 'antd'
import styles from './style.module.scss'
import { useContext, useState } from 'react'
import { GameContext } from '../../AppUI'
import { ECardType, EColor } from '../../core/entity/common'
import { checkSendCard } from '../../core/service'

const map = {
  [EColor.R]: {
    cls: styles.Red,
    color: '红色',
  },
  [EColor.G]: {
    cls: styles.Green,
    color: '绿色',
  },
  [EColor.B]: {
    cls: styles.Blue,
    color: '蓝色',
  },
  [EColor.Y]: {
    cls: styles.Yellow,
    color: '黄色',
  },
} as any

export default function Operations({
  hiddenNextTurn,
}: {
  hiddenNextTurn?: boolean
}) {
  const {
    currentCard,
    currentCardIdx,
    setCurrentCard,
    setCurrentCardIdx,
    game,
    forceRender,
    nextTurn,
  } = useContext(GameContext)
  const [open, setOpen] = useState(false)

  const palyFunc = () => {
    if (!currentCard) {
      message.error('请选择要出的牌')
      return
    }
    const canSend = checkSendCard(game, currentCard)
    if (!canSend) {
      message.error('不能出这张牌')
      return
    }
    if (currentCard.type === ECardType.King) {
      setOpen(true)
    } else {
      const status = nextTurn(currentCardIdx)
      setCurrentCardIdx(-1)
      setCurrentCard(undefined)
      if (status) {
        message.success(status)
      }
      forceRender()
    }
  }

  console.log('currentCard', currentCard)
  const isFinished = game.users.some((p) => p.cards.length === 0) || location.search === '?r=0' // 游戏结束
  return (
    <div className={styles.Operations}>
      <Button
        size="large"
        onClick={() => {
          nextTurn(-1)
          setCurrentCardIdx(-1)
          setCurrentCard(undefined)
          forceRender()
        }}
      >
        抓牌
      </Button>
      <Popover
        content={
          <div>
            {Object.keys(map).map((key) => {
              const { cls, color } = map[key]
              return (
                <Button
                  key={color}
                  shape="circle"
                  className={cx(styles.ColorBtn, cls)}
                  onClick={() => {
                    const status = nextTurn(currentCardIdx, key as EColor)
                    if (status) {
                      message.success(status)
                    }
                    setOpen(false)
                    setCurrentCardIdx(-1)
                    setCurrentCard(undefined)
                    forceRender()
                  }}
                >
                  {color}
                </Button>
              )
            })}
          </div>
        }
        title="选择颜色"
        open={open}
      >
        <Button size="large" onClick={palyFunc}>
          出牌
        </Button>
      </Popover>
      {!hiddenNextTurn && (
        <Button
          size="large"
          onClick={() => {
            const status = nextTurn()
            forceRender()
            if (status) {
              message.success(status)
            }
          }}
        >
          下一轮
        </Button>
      )}
      {isFinished && (
        <Button
        size="large"
        onClick={() => {
          window.socketSend({
            type: 'restart',
            data: {},
          })
        }}
      >
        重开
      </Button>
      )}
      
    </div>
  )
}
