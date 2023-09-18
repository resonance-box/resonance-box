import { type Note } from '@resonance-box/store'
import { NoteNumber } from '../events'
import { Ticks } from '../shared'
import { type NoteOff, type NoteOn } from './types'

export const disassembleNote = (note: Readonly<Note>): [NoteOn, NoteOff] => {
  const noteOnEvent: NoteOn = {
    type: 'NoteOn',
    ticks: new Ticks(note.ticks),
    velocity: new Ticks(note.velocity),
    noteNumber: new NoteNumber(note.noteNumber),
  }

  const noteOffEvent: NoteOff = {
    type: 'NoteOff',
    ticks: new Ticks(note.ticks).add(new Ticks(note.duration)),
    noteNumber: new NoteNumber(note.noteNumber),
  }

  return [noteOnEvent, noteOffEvent]
}

export const disassembleNotes = (
  notes: Readonly<Note[]>,
): Array<NoteOn | NoteOff> => {
  return notes.flatMap((event) => {
    return disassembleNote(event)
  })
}

export const filterEventsWithTicksRange = <T extends { ticks: Ticks }>(
  events: T[],
  startTicks: Ticks,
  endTicks: Ticks,
): T[] =>
  events.filter(
    (event) =>
      event.ticks.value >= startTicks.value &&
      event.ticks.value < endTicks.value,
  )
