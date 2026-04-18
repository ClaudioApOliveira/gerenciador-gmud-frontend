import { describe, expect, it } from 'bun:test'
import { IncidentStatus } from '../data/operationsData'
import { i18n } from '../i18'
import {
    getIncidentFieldErrors,
    incidentSchema,
    initialIncidentForm,
} from './incidentSchema'

describe('incidentSchema', () => {
    it('accepts valid incident data', () => {
        const result = incidentSchema.safeParse({
            numeroIM: 'INC1234567',
            grupoAtribuicao: 'Parcerias - Aplicação',
            statusIM: IncidentStatus.Resolvido,
            job: 'Reprocessamento',
        })

        expect(result.success).toBe(true)

        if (result.success) {
            expect(result.data.statusIM).toBe(IncidentStatus.Resolvido)
            expect(result.data.numeroIM).toBe('INC1234567')
        }
    })

    it('returns mapped field errors for invalid data', () => {
        const result = incidentSchema.safeParse({
            numeroIM: '123',
            grupoAtribuicao: 'A',
            statusIM: IncidentStatus.Acompanhando,
            job: 'x',
        })

        expect(result.success).toBe(false)

        if (!result.success) {
            const errors = getIncidentFieldErrors(result.error)

            expect(errors.numeroIM).toBe(i18n.gmuds.editPage.validationImNumber)
            expect(errors.grupoAtribuicao).toBe(i18n.gmuds.editPage.validationAssignmentGroup)
            expect(errors.job).toBe(i18n.gmuds.editPage.validationJob)
        }
    })

    it('provides the expected initial form state', () => {
        expect(initialIncidentForm).toEqual({
            numeroIM: '',
            grupoAtribuicao: '',
            statusIM: IncidentStatus.Acompanhando,
            job: '',
        })
    })
})
