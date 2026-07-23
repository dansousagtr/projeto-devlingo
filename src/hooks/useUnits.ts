import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Unit } from '../types'
import { unitsData as staticUnitsData } from '../data/units'

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar unidades
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, title, description')
          .order('id', { ascending: true })

        if (unitsError) throw unitsError

        const fetchedUnits: Unit[] = (unitsData || []).map((unit) => ({
          id: unit.id,
          title: unit.title,
          description: unit.description || '',
          number: parseInt(unit.id.toString().split('-')[0]) || 0,
          lessons: [],
        }))

        const effectiveUnits: Unit[] =
          fetchedUnits.length > 0 ? fetchedUnits : staticUnitsData

        // Buscar lições para cada unidade
        const unitsWithLessons = await Promise.all(
          effectiveUnits.map(async (unit) => {
            const fallbackUnit = staticUnitsData.find(
              (staticUnit) => staticUnit.id.toString() === unit.id.toString()
            )
            const fallbackLessons = fallbackUnit?.lessons || []

            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('id, title, description, xp_reward, unit_id')
              .eq('unit_id', unit.id)
              .order('id', { ascending: true })

            if (lessonsError) {
              console.error(`Erro ao buscar lições para unidade ${unit.id}:`, lessonsError)
              return {
                id: unit.id,
                title: unit.title,
                description: unit.description || '',
                number: unit.number,
                lessons: fallbackLessons,
              }
            }

            const finalLessons = (lessonsData || []).map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || '',
              xp: lesson.xp_reward || 0,
              completed: false,
            }))

            return {
              id: unit.id,
              title: unit.title,
              description: unit.description || '',
              number: unit.number,
              lessons: finalLessons.length > 0 ? finalLessons : fallbackLessons,
            }
          })
        )

        setUnits(unitsWithLessons)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao buscar unidades'
        setError(message)
        console.error('Erro ao buscar unidades:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  return { units, loading, error }
}
