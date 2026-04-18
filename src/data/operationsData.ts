export const ChangeStatus = {
    Aberta: 'Aberta',
    EmAndamento: 'Em andamento',
    Concluida: 'Concluída',
    Pendente: 'Pendente',
    Cancelada: 'Cancelada',
} as const

export type ChangeStatus = (typeof ChangeStatus)[keyof typeof ChangeStatus]

export const IncidentStatus = {
    Resolvido: 'Resolvido',
    Acompanhando: 'Acompanhando',
} as const

export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus]

export interface ChangeRecord {
    id: string
    nomeProjeto: string
    numeroProjeto: string
    sprint: string
    statusChange: ChangeStatus
    tipoProjeto: string
    desenvolvedorNova: string
    responsavelBrasilseg: string
}

export interface IncidentRecord {
    id: string
    changeId: string
    grupoAtribuicao: string
    numeroIM: string
    statusIM: IncidentStatus
    dataAbertura: string
    dataFechamento: string
    job: string
}

export const changes: ChangeRecord[] = [
    // {
    //     id: 'CHG0064353',
    //     nomeProjeto:
    //         'STRY0127343 / STRY0128429 / STRY0127342 – Tratativa dos Projetos [SEGBR][Equatorial]',
    //     numeroProjeto: 'PRJ0282499',
    //     sprint: 'Sprint 6 - Parcerias',
    //     statusChange: ChangeStatus.Cancelada,
    //     tipoProjeto: 'Implantação/Projeto',
    //     desenvolvedorNova: '—',
    //     responsavelBrasilseg: '—',
    // },
    // {
    //     id: 'CHG0064577',
    //     nomeProjeto:
    //         'STRY0127343 / STRY0128429 / STRY0127342 / STRY0127737 – Identificação de Limpeza de Base',
    //     numeroProjeto: 'PRJ0282499',
    //     sprint: 'Sprint 6 - Parcerias',
    //     statusChange: ChangeStatus.Cancelada,
    //     tipoProjeto: 'Implantação/Projeto',
    //     desenvolvedorNova: 'Sergio',
    //     responsavelBrasilseg: 'Lucrecia',
    // },
    // {
    //     id: 'CHG0064818',
    //     nomeProjeto: 'Ajuste no envio de dados do proponente para o Ultron',
    //     numeroProjeto: '—',
    //     sprint: '—',
    //     statusChange: ChangeStatus.Concluida,
    //     tipoProjeto: 'Fix',
    //     desenvolvedorNova: 'Claudio',
    //     responsavelBrasilseg: 'Luana',
    // },
    // {
    //     id: 'CHG0064922',
    //     nomeProjeto: 'Ajuste devido a erro na leitura do arquivo',
    //     numeroProjeto: '—',
    //     sprint: '—',
    //     statusChange: ChangeStatus.Concluida,
    //     tipoProjeto: 'Fix',
    //     desenvolvedorNova: 'Sergio',
    //     responsavelBrasilseg: 'Lucrecia',
    // },
    // {
    //     id: 'CHG0066072',
    //     nomeProjeto: '[SEGBR][Equatorial - 124] – Aceite de pagamento por CNPJ',
    //     numeroProjeto: 'PRJ0282499',
    //     sprint: 'Sprint 6 - Parcerias',
    //     statusChange: ChangeStatus.Concluida,
    //     tipoProjeto: 'Implantação/Projeto',
    //     desenvolvedorNova: 'Sergio',
    //     responsavelBrasilseg: 'Lucrecia',
    // },
    // {
    //     id: 'CHG0067159',
    //     nomeProjeto: 'Subvenção – Parameter Store e atualização do payload de subvenção federal',
    //     numeroProjeto: '—',
    //     sprint: '—',
    //     statusChange: ChangeStatus.Concluida,
    //     tipoProjeto: 'Fix',
    //     desenvolvedorNova: 'Claudio',
    //     responsavelBrasilseg: 'Luana',
    // },
    // {
    //     id: 'CHG0068836',
    //     nomeProjeto: 'Parcerias – Tabela de dados de adesão da Sura',
    //     numeroProjeto: 'PRJ0304753',
    //     sprint: 'Parcerias - Evolução',
    //     statusChange: ChangeStatus.Pendente,
    //     tipoProjeto: 'Implantação/Projeto',
    //     desenvolvedorNova: 'Sergio',
    //     responsavelBrasilseg: 'Alcides',
    // },
    // {
    //     id: 'CHG0069046',
    //     nomeProjeto: 'Criação de recurso para lambda',
    //     numeroProjeto: '—',
    //     sprint: '—',
    //     statusChange: ChangeStatus.Pendente,
    //     tipoProjeto: 'Fix',
    //     desenvolvedorNova: 'Claudio',
    //     responsavelBrasilseg: 'Alcides',
    // },
    // {
    //     id: 'CHG0070521',
    //     nomeProjeto: 'Correção no questionário e ordenação do histórico',
    //     numeroProjeto: '—',
    //     sprint: '—',
    //     statusChange: ChangeStatus.Pendente,
    //     tipoProjeto: 'Fix',
    //     desenvolvedorNova: 'Claudio',
    //     responsavelBrasilseg: 'Luana',
    // },
]

export const incidents: IncidentRecord[] = [
    {
        id: 'INC0556969',
        changeId: 'CHG0068836',
        grupoAtribuicao: 'Parcerias - Aplicação',
        numeroIM: 'INC0556969',
        statusIM: IncidentStatus.Resolvido,
        dataAbertura: '09/01/2026 11:12',
        dataFechamento: '16/01/2026 11:27',
        job: 'Validação da adesão',
    },
    // {
    //     id: 'INC0556969',
    //     changeId: 'CHG0068836',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0556969',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '09/01/2026 11:12',
    //     dataFechamento: '16/01/2026 11:27',
    //     job: 'Validação da adesão',
    // },
    // {
    //     id: 'INC0557122',
    //     changeId: 'CHG0068836',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0557122',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '12/01/2026 12:40',
    //     dataFechamento: '13/01/2026 10:26',
    //     job: 'Ajuste de integração',
    // },
    // {
    //     id: 'INC0558077',
    //     changeId: 'CHG0068836',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0558077',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '13/01/2026 11:58',
    //     dataFechamento: '14/01/2026 00:00',
    //     job: 'Reprocessamento',
    // },
    // {
    //     id: 'INC0593241',
    //     changeId: 'CHG0067159',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0593241',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '19/02/2026 10:26',
    //     dataFechamento: '19/02/2026 19:00',
    //     job: 'Payload federal',
    // },
    // {
    //     id: 'INC0596972',
    //     changeId: 'CHG0067159',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0596972',
    //     statusIM: IncidentStatus.Acompanhando,
    //     dataAbertura: '23/02/2026 16:07',
    //     dataFechamento: '24/02/2026 16:07',
    //     job: 'Monitoramento',
    // },
    // {
    //     id: 'INC0624704',
    //     changeId: 'CHG0069046',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0624704',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '25/02/2026 13:42',
    //     dataFechamento: '01/04/2026 13:43',
    //     job: 'Lambda em produção',
    // },
    // {
    //     id: 'INC0626524',
    //     changeId: 'CHG0064818',
    //     grupoAtribuicao: 'Desenvolvimento Dados Nova',
    //     numeroIM: 'INC0626524',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '20/03/2026 20:41',
    //     dataFechamento: '21/03/2026 00:00',
    //     job: 'Envio para Ultron',
    // },
    // {
    //     id: 'INC0628336',
    //     changeId: 'CHG0068836',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0628336',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '23/03/2026 18:01',
    //     dataFechamento: '23/03/2026 14:14',
    //     job: 'Ajuste Sura',
    // },
    // {
    //     id: 'INC0631011',
    //     changeId: 'CHG0070521',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0631011',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '25/03/2026 13:38',
    //     dataFechamento: '27/03/2026 14:08',
    //     job: 'Histórico agrícola',
    // },
    // {
    //     id: 'INC0633745',
    //     changeId: 'CHG0070521',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0633745',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '27/03/2026 14:36',
    //     dataFechamento: '01/04/2026 13:48',
    //     job: 'Consulta histórica',
    // },
    // {
    //     id: 'INC0626630',
    //     changeId: 'CHG0069046',
    //     grupoAtribuicao: 'Parcerias - Aplicação',
    //     numeroIM: 'INC0626630',
    //     statusIM: IncidentStatus.Resolvido,
    //     dataAbertura: '30/03/2026 19:33',
    //     dataFechamento: '31/03/2026 11:05',
    //     job: 'Ajuste complementar',
    // },
    // {
    //     id: 'INC0651160',
    //     changeId: 'CHG0070521',
    //     grupoAtribuicao: 'Desenvolvimento Rural Nova',
    //     numeroIM: 'INC0651160',
    //     statusIM: IncidentStatus.Acompanhando,
    //     dataAbertura: '07/04/2026 12:09',
    //     dataFechamento: '—',
    //     job: 'Questionário e ordenação',
    // },
]

export function getIncidentsByChange(changeId: string) {
    return incidents.filter((incident) => incident.changeId === changeId)
}

export function getStatusClass(status: string) {
    const normalizedStatus = status
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '_')

    if (normalizedStatus === 'concluida' || normalizedStatus === 'resolvido') {
        return 'success'
    }

    if (normalizedStatus === 'cancelada' || normalizedStatus === 'cancelado') {
        return 'danger'
    }

    return 'warning'
}
