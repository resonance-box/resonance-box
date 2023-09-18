import { createStore, type Store } from '@resonance-box/store'
import {
  DEFAULT_LOOK_AHEAD_TIME,
  Milliseconds,
  millisecondsToTicks,
  Seconds,
  Ticks,
  ticksToSeconds,
  type BPM,
  type PPQ,
} from '../shared'
import { PlayerImpl, type Player } from './player'
import { disassembleNote } from './utils'

export interface EngineConfig {
  lookAheadTime?: Milliseconds
}

export interface Engine {
  play: () => void
  stop: () => void
  getCurrentTicks: () => Ticks
  getCurrentSeconds: () => Seconds
  getBpm: () => BPM
  setBpm: (bpm: BPM) => void
  getPpq: () => PPQ
  setPpq: (ppq: PPQ) => void
  getStore: () => Store
  setSynthesizerPort: (port: MessagePort) => void
}

class EngineImpl implements Engine {
  private readonly lookAheadTime: Milliseconds
  private scheduledTicks: Ticks
  private readonly player: Player
  private readonly store: Store
  private synthesizerPort?: MessagePort

  constructor(store: Store, config?: EngineConfig) {
    this.lookAheadTime =
      config?.lookAheadTime ?? new Milliseconds(DEFAULT_LOOK_AHEAD_TIME)
    this.scheduledTicks = new Ticks(0)
    this.player = new PlayerImpl()
    this.store = store
    this.synthesizerPort = undefined

    this.player.onUpdate = ({ ticks }) => {
      const startTicks = this.scheduledTicks

      const endTicks = ticks.add(
        millisecondsToTicks(
          this.lookAheadTime,
          this.player.bpm,
          this.player.ppq,
        ),
      )

      this.store
        .getEventsInTicksRange(startTicks.value, endTicks.value, false)
        .forEach((event) => {
          const [noteOnEvent, noteOffEvent] = disassembleNote(event)

          if (this.synthesizerPort !== undefined) {
            const noteOnDelayTicks = noteOnEvent.ticks.saturatingSub(startTicks)
            const noteOnDelayTime = new Seconds(
              Math.max(
                0,
                ticksToSeconds(
                  noteOnDelayTicks,
                  this.player.bpm,
                  this.player.ppq,
                ).value,
              ),
            )

            this.synthesizerPort.postMessage({
              kind: 'noteOn',
              noteNumber: noteOnEvent.noteNumber.value,
              velocity: noteOnEvent.velocity.value,
              delayTime: noteOnDelayTime.value,
            })

            const noteOffDelayTicks =
              noteOffEvent.ticks.saturatingSub(startTicks)
            const noteOffDelayTime = new Seconds(
              Math.max(
                0,
                ticksToSeconds(
                  noteOffDelayTicks,
                  this.player.bpm,
                  this.player.ppq,
                ).value,
              ),
            )

            this.synthesizerPort.postMessage({
              kind: 'noteOff',
              noteNumber: noteOffEvent.noteNumber.value,
              delayTime: noteOffDelayTime.value,
            })
          }
        })

      this.scheduledTicks = endTicks
    }
  }

  get playing(): boolean {
    return this.player.playing
  }

  play(): void {
    this.player.play()
  }

  stop(): void {
    this.scheduledTicks = new Ticks(0)
    this.player.stop()
  }

  getCurrentTicks(): Ticks {
    return this.player.ticks
  }

  getCurrentSeconds(): Seconds {
    return this.player.seconds
  }

  getBpm(): BPM {
    return this.player.bpm
  }

  setBpm(bpm: BPM): void {
    this.player.bpm = bpm
  }

  getPpq(): PPQ {
    return this.player.ppq
  }

  setPpq(ppq: PPQ): void {
    this.player.ppq = ppq
  }

  getStore(): Store {
    return this.store
  }

  setSynthesizerPort(port: MessagePort): void {
    this.synthesizerPort = port
  }
}

export async function createEngine(config?: EngineConfig): Promise<Engine> {
  const store = await createStore()
  return new EngineImpl(store, config)
}
