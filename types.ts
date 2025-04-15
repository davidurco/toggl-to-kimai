export type KimaiMetaField = {
    name: string
    value: string
}

export type KimaiUser = {
    apiToken: boolean
    initials: string
    id: number
    alias: string
    title: string
    username: string
    accountNumber: string
    enabled: boolean
    color: string
}

export type KimaiTeamMember = {
    user: KimaiUser
    teamlead: boolean
}

export type KimaiCustomer = {
    id: number
    name: string
    number: string
    comment: string
    visible: boolean
    billable: boolean
    color: string
}

export type KimaiProject = {
    customer: number
    id: number
    name: string
    comment: string
    visible: boolean
    billable: boolean
    globalActivities: boolean
    number: string
    color: string
}

export type KimaiActivity = {
    project: number
    id: number
    name: string
    comment: string
    visible: boolean
    billable: boolean
    number: string
    color: string
}

export type KimaiTeam = {
    id: number
    name: string
    members: KimaiTeamMember[]
    customers: KimaiCustomer[]
    projects: KimaiProject[]
    activities: KimaiActivity[]
    color: string
}

export type KimaiProjectDetailed = {
    parentTitle: string
    customer: number
    id: number
    name: string
    start: string
    end: string
    comment: string
    visible: boolean
    billable: boolean
    metaFields: KimaiMetaField[]
    teams: KimaiTeam[]
    globalActivities: boolean
    number: string
    color: string
}

export type KimaiTimeEntryDetailed = {
    id: number
    begin: string
    end: string
    project: number
    activity: number
    description: string
    user: number
    tags: string[]
    exported: boolean
    billable: boolean
    duration: number
    rate: number
    internalRate: number
    metaFields: KimaiMetaField[]
}

export type TogglProject = {
    id: number
    workspace_id: number
    client_id: number
    name: string
    is_private: boolean
    active: boolean
    at: string
    created_at: string
    server_deleted_at: string | null
    color: string
    billable: boolean
    template: unknown | null
    auto_estimates: boolean | null
    estimated_hours: number | null
    estimated_seconds: number | null
    rate: number | null
    rate_last_updated: string | null
    currency: string | null
    recurring: boolean
    template_id: number | null
    recurring_parameters: unknown | null
    fixed_fee: number | null
    actual_hours: number
    actual_seconds: number
    total_count: number
    client_name: string
    can_track_time: boolean
    start_date: string
    status: 'active' | 'archived' | string
    wid: number
    cid: number
    pinned: boolean
}

export type TogglTimeEntry = {
    id: number
    workspace_id: number
    project_id: number
    task_id: number | null
    billable: boolean
    start: string
    stop: string | null
    duration: number
    description: string
    tags: string[]
    tag_ids: number[]
    duronly: boolean
    at: string
    server_deleted_at: string | null
    user_id: number
    uid: number
    wid: number
    pid: number
}

export type KimaiTimesheetPayload = {
    begin: string
    end: string
    project: number
    activity: number
    description?: string
    fixedRate?: number
    hourlyRate?: number
    internalRate?: number
    user?: number
    tags?: string | string[]
    exported?: boolean
    billable?: boolean
}
