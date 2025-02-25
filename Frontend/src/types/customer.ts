import { User } from "next-auth";

interface Industry {
    id: number;
    name: string;
}

interface Status {
    id: number;
    name: string;
}

interface Source {
    id: number;
    name: string;
}

interface Contact {
    id: number;
    tenant_id: number;
    customer_id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    department: string | null;
    is_primary: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Customer {
    id: number;
    tenant_id: number;
    name: string;
    company: string;
    industry_id: number;
    email: string;
    phone: string;
    address: string;
    website: string;
    status_id: number;
    source_id: number;
    description: string;
    assigned_to_id: number;
    created_at: string;
    updated_at: string;
    industry: Industry;
    status: Status;
    source: Source;
    contacts: Contact[];
    assigned_to: User;
}

export type { Industry, Status, Source, Customer, Contact };