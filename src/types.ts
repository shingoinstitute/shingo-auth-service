export interface User {
    id: number;
    email: string;
    jwt: string;
    services: string;
    permissions: Permission[];
    roles: Role[];
    isEnabled: boolean;
    password: string;
    extId: string;
    resetToken: string;
    lastLogin: string;
}

export interface Permission {
    id: number;
    resource: string;
    level: 0 | 1 | 2;
    roles: Role[];
    users: User[];
}

export interface Role {
    id: number;
    name: string;
    service: string;
    permissions: Permission[];
    users: User[];
}

export interface BooleanResponse {
    response: boolean;
}

export interface UserBatch {
    users: User[];
}

export interface RoleBatch {
    roles: Role[];
}

export interface PermissionSet {
    permissionId: number;
    accessorId: number;
}
