import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { subjectsByLevel } from './curriculumLevels'
import { classGroupAriaLabel, SubjectsByClass } from './SubjectsByClass'
import { TRAINERS } from './trainers'

describe('classGroupAriaLabel', () => {
  it('décrit classe et matières', () => {
    expect(classGroupAriaLabel('Terminale C', ['Mathématiques', 'Physique-Chimie'])).toBe(
      'Terminale C : Mathématiques, Physique-Chimie',
    )
  })
})

describe('SubjectsByClass — Koffi Adjovi', () => {
  const koffi = TRAINERS.find((trainer) => trainer.id === 'koffi-adjovi')!

  it('n’associe pas Physique-Chimie à la 3e', () => {
    const groups = subjectsByLevel(koffi.subjects)
    const third = groups.find((group) => group.level === '3e')
    expect(third?.subjects).toEqual(['Mathématiques'])
    expect(third?.subjects).not.toContain('Physique-Chimie')

    const terminaleC = groups.find((group) => group.level === 'Terminale C')
    expect(terminaleC?.subjects).toContain('Physique-Chimie')
  })

  it('sur la liste formateurs : pastilles non cliquables + hint', () => {
    const groups = subjectsByLevel(koffi.subjects)
    render(
      <MemoryRouter>
        <SubjectsByClass groups={groups} showHint subjectLinks="none" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Une ligne = une classe et ses matières')).toBeInTheDocument()

    const row3e = screen.getByRole('group', { name: '3e : Mathématiques' })
    expect(within(row3e).queryByRole('link')).not.toBeInTheDocument()
    expect(within(row3e).getByText('Mathématiques')).toBeInTheDocument()
    expect(within(row3e).queryByText('Physique-Chimie')).not.toBeInTheDocument()
  })

  it('en mode catalog : pastille mène aux séances filtrées', () => {
    const groups = subjectsByLevel(koffi.subjects)
    render(
      <MemoryRouter>
        <SubjectsByClass groups={groups} showHint subjectLinks="catalog" />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Une ligne = une classe · toucher une matière ouvre les séances'),
    ).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Séances Mathématiques en 3e' })
    expect(link).toHaveAttribute('href', '/catalogue?matiere=Math%C3%A9matiques&niveau=3e')
  })
})
