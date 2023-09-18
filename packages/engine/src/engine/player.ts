import {
  BPM,
  DEFAULT_BPM,
  DEFAULT_PPQ,
  DEFAULT_UPDATE_INTERVAL_TIME,
  Milliseconds,
  millisecondsToTicks,
  PPQ,
  Seconds,
  Ticks,
} from '../shared'

export interface Player {
  ticks: Ticks
  seconds: Seconds
  bpm: BPM
  ppq: PPQ
  playing: boolean
  play: () => void
  stop: () => void
  onUpdate?: OnUpdate
}

type OnUpdate = (time: { ticks: Ticks; seconds: Seconds }) => void

interface PlayerConfig
  extends Partial<{
    bpm: BPM
    ppq: PPQ
    updateIntervalTime: Milliseconds
  }> {}

export class PlayerImpl implements Player {
  playing: boolean
  ticks: Ticks
  seconds: Seconds
  bpm: BPM
  ppq: PPQ
  private prevTime?: Milliseconds
  private readonly updateIntervalTime: Milliseconds
  private intervalId?: NodeJS.Timeout
  onUpdate?: OnUpdate

  constructor(config?: PlayerConfig) {
    this.playing = false
    this.ticks = new Ticks(0)
    this.seconds = new Seconds(0)
    this.bpm = config?.bpm ?? new BPM(DEFAULT_BPM)
    this.ppq = config?.ppq ?? new PPQ(DEFAULT_PPQ)
    this.updateIntervalTime =
      config?.updateIntervalTime ??
      new Milliseconds(DEFAULT_UPDATE_INTERVAL_TIME)
    this.intervalId = undefined
  }

  play(): void {
    if (this.playing) {
      console.warn('Player is already playing.')
      return
    }

    this.playing = true
    this.intervalId = setInterval(() => {
      this.next()
    }, this.updateIntervalTime.value)
  }

  private next(): void {
    const timestamp = new Milliseconds(performance.now())
    if (this.prevTime === undefined) {
      this.prevTime = timestamp
    }

    const deltaTime = timestamp.saturatingSub(this.prevTime)
    const deltaTicks = new Ticks(
      Math.max(0, millisecondsToTicks(deltaTime, this.bpm, this.ppq).value),
    )

    this.ticks = this.ticks.add(deltaTicks)
    this.seconds = this.seconds.add(deltaTime.toSeconds())

    if (this.onUpdate != null) {
      this.onUpdate({ ticks: this.ticks, seconds: this.seconds })
    }

    this.prevTime = timestamp
  }

  stop(): void {
    this.playing = false
    this.ticks = new Ticks(0)
    this.seconds = new Seconds(0)
    this.prevTime = undefined

    if (this.intervalId != null) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }
}
