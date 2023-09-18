import { type Event, type NoteNumber, type Velocity } from '../events'
import { type Ticks } from '../shared'

export interface NoteOn extends Event<'NoteOn'> {
  type: 'NoteOn'
  ticks: Ticks
  noteNumber: NoteNumber
  velocity: Velocity
}

export interface NoteOff extends Event<'NoteOff'> {
  type: 'NoteOff'
  ticks: Ticks
  noteNumber: NoteNumber
}
