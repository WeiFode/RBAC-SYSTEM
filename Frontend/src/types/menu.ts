export interface MenuItem {
    id: number;
    title: string;
    path: string;
    component_path: string | null;
    icon: any;
    parent_id: number | null;
    sort?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    children?: MenuItem[];
    status?: number | null;
    permission_items?: string[] | null;
}