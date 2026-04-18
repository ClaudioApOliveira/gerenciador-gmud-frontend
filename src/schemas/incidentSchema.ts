import { z } from 'zod'
import { IncidentStatus } from '../data/operationsData'
import { i18n } from '../i18'

export const incidentSchema = z.object({
    numeroIM: z.string().trim().min(5, i18n.gmuds.editPage.validationImNumber),
    grupoAtribuicao: z
        .string()
        .trim()
        .min(3, i18n.gmuds.editPage.validationAssignmentGroup),
    statusIM: z.enum([IncidentStatus.Acompanhando, IncidentStatus.Resolvido]),
    job: z.string().trim().min(3, i18n.gmuds.editPage.validationJob),
})

export type IncidentFormData = z.infer<typeof incidentSchema>
export type IncidentFormErrors = Partial<Record<keyof IncidentFormData, string>>

export const initialIncidentForm: IncidentFormData = {
    numeroIM: '',
    grupoAtribuicao: '',
    statusIM: IncidentStatus.Acompanhando,
    job: '',
}

export function getIncidentFieldErrors(error: z.ZodError<IncidentFormData>): IncidentFormErrors {
    const fieldErrors = z.flattenError(error).fieldErrors

    return {
        numeroIM: fieldErrors.numeroIM?.[0],
        grupoAtribuicao: fieldErrors.grupoAtribuicao?.[0],
        statusIM: fieldErrors.statusIM?.[0],
        job: fieldErrors.job?.[0],
    }
}
