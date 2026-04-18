import { describe, expect, it } from 'bun:test'
import {
    ChangeStatus,
    IncidentStatus,
    getIncidentsByChange,
    getStatusClass,
} from './operationsData'

describe('operationsData helpers', () => {
    it('returns only incidents for the selected change', () => {
        const result = getIncidentsByChange('CHG0068836')

        expect(result.length).toBeGreaterThan(0)
        expect(result.every((incident) => incident.changeId === 'CHG0068836')).toBe(true)
    })

    it('maps each status to the correct badge class', () => {
        expect(getStatusClass(ChangeStatus.Concluida)).toBe('success')
        expect(getStatusClass(ChangeStatus.Pendente)).toBe('warning')
        expect(getStatusClass(ChangeStatus.Cancelada)).toBe('danger')
        expect(getStatusClass(IncidentStatus.Resolvido)).toBe('success')
        expect(getStatusClass(IncidentStatus.Acompanhando)).toBe('warning')
    })
})
