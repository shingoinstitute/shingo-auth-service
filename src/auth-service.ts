import * as grpc from 'grpc';
import * as bluebird from 'bluebird';
import { join } from 'path' ;
import { User, Permission, Role, BooleanResponse, UserBatch, RoleBatch, PermissionSet } from '.';
import { Omit } from 'type-zoo';

const authservices = grpc.load(join(__dirname, './auth_services.proto')).authservices;

export class AuthService {
    private client: any;

    constructor(uri: string = `${process.env.AUTH_API}:80`) {
        this.client = bluebird.promisifyAll(this.getClient(uri));
    }

    private getClient(uri: string) {
        return new authservices.AuthServices(uri, grpc.credentials.createInsecure());
    }

    /**
     * Get an list of users using a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns A list of users
     */
    public getUsers(clause: string): Promise<UserBatch> {
        return this.client.readUserAsync({ clause });
    }

    /**
     * Get a single user using a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns The user
     */
    public getUser(clause: string): Promise<User> {
        return this.client.readOneUserAsync({ clause });
    }

    /**
     * Create a user in the Auth database
     *
     * @param email - Email
     * @param password - Password
     * @param services - Services available to user
     * @param extId - External Salesforce id
     * @returns The created user
     */
    public createUser(email: string, password: string, services: string, extId?: string): Promise<User> {
        return this.client.createUserAsync({
            email, password, services, extId,
        });
    }

    /**
     * Update a user in the Auth database
     *
     * @param user - A user object. Properties: one of [id, extId] and one or more of [email, password, services]
     * @returns A boolean response
     */
    public updateUser(user: Partial<User> & (Pick<User, 'id'> | Pick<User, 'extId'>)): Promise<BooleanResponse> {
        return this.client.updateUserAsync(user);
    }

    /**
     * Delete a user from the Auth database
     *
     * @param user - User object to delete. Properties: one of [id, extId]
     * @returns A boolean response
     */
    public deleteUser(user: Pick<User, 'id'> | Pick<User, 'extId'>): Promise<BooleanResponse> {
        return this.client.deleteUserAsync(user);
    }

    /**
     * Add a role to a user identified by email
     *
     * @param userEmail - User email
     * @param roleId - Role id
     * @returns A boolean response
     */
    public addRoleToUser(userEmail: string, roleId: number): Promise<BooleanResponse> {
        return this.client.addRoleToUserAsync({ userEmail, roleId });
    }

    /**
     * Remove a role from a user identified by email
     *
     * @param userEmail - User email
     * @param roleId - Role id
     * @returns A boolean response
     */
    public removeRoleFromUser(userEmail: string, roleId: number): Promise<BooleanResponse> {
        return this.client.removeRoleFromUserAsync({ userEmail, roleId });
    }

    /**
     * Get a list of permissions using a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns The list of permissions
     */
    public getPermissions(clause: string): Promise<Permission[]> {
        return this.client.readPermissionAsync({ clause });
    }

    /**
     * Get a single permission using a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns The permission
     */
    public getPermission(clause: string): Promise<Permission> {
        return this.client.readOnePermissionAsync({ clause });
    }

    /**
     * Create a permission
     *
     * @param permission - Permission to be created
     * @returns The created permission
     */
    public createPermission(permission: Omit<Permission, 'id'|'roles'|'users'>): Promise<Permission> {
        return this.client.createPermissionAsync(permission);
    }

    /**
     * Update a permission
     *
     * @param permission - Permission to update
     * @returns A boolean response
     */
    public updatePermission(permission: Partial<Permission> & Pick<Permission, 'id'>): Promise<BooleanResponse> {
        return this.client.updatePermissionAsync(permission);
    }

    /**
     * Delete a permission
     *
     * @param resource - Permission resource
     * @param level - Permission level
     * @returns A boolean response
     */
    public deletePermission(resource: string, level: 0 | 1 | 2): Promise<BooleanResponse> {
        return this.client.deletePermissionAsync({ resource, level });
    }

    /**
     * Get a list of roles based on a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns A list of roles
     */
    public getRoles(clause: string): Promise<RoleBatch> {
        return this.client.readRoleAsync({ clause });
    }

    /**
     * Get a single role based on a TypeORM query
     *
     * @param clause - A TypeORM query. See [here](http://typeorm.io/#/select-query-builder) for documentation
     * @returns The role
     */
    public getRole(clause: string): Promise<Role> {
        return this.client.readOneRoleAsync({ clause });
    }

    /**
     * Create a role
     *
     * @param role - Role to create
     * @returns The role
     */
    public createRole(role: Omit<Role, 'id'|'permissions'|'users'>): Promise<Role> {
        return this.client.createRoleAsync(role);
    }

    /**
     * Update a role
     *
     * @param role - Role to update
     * @returns A boolean response
     */
    public updateRole(role: Role): Promise<BooleanResponse> {
        return this.client.updateRoleAsync(role);
    }

    /**
     * Delete a role
     *
     * @param role - Role object to delete
     * @returns A boolean response
     */
    public deleteRole(role: Pick<Role, 'id'>): Promise<BooleanResponse> {
        return this.client.deleteRoleAsync(role);
    }

    /**
     * Grant permission to a user based on resource and level
     *
     * @param resource - Resource to grant permissions to
     * @param level - Level to grant (0=Deny,1=Read,2=Write)
     * @param userId - User id
     * @returns The permission set
     */
    public grantPermissionToUser(resource: string, level: 0 | 1 | 2, userId: number): Promise<PermissionSet> {
        return this.client.grantPermissionToUserAsync({ resource, level, accessorId: userId });
    }

    /**
     * Grant permission to a role based on resource and level
     *
     * @param resource - Resource to grant permissions to
     * @param level - Level to grant (0=Deny,1=Read,2=Write)
     * @param roleId - Role id
     * @returns The permission set
     */
    public grantPermissionToRole(resource: string, level: 0 | 1 | 2, roleId: number): Promise<PermissionSet> {
        return this.client.grantPermissionToRoleAsync({ resource, level, accessorId: roleId });
    }

    /**
     * Revoke permission from a user based on resource and level
     *
     * @param resource - Resource to revoke permissions to
     * @param level - Level to revoke (0=Deny,1=Read,2=Write)
     * @param userId - User id
     * @returns The permission set
     */
    public revokePermissionFromUser(resource: string, level: 0 | 1 | 2, userId: number): Promise<PermissionSet> {
        return this.client.revokePermissionFromUserAsync({ resource, level, accessorId: userId });
    }

    /**
     * Revoke permission from a user based on resource and level
     *
     * @param resource - Resource to revoke permissions to
     * @param level - Level to revoke (0=Deny,1=Read,2=Write)
     * @param roleId - Role id
     * @returns The permission set
     */
    public revokePermissionFromRole(resource: string, level: 0 | 1 | 2, roleId: number): Promise<PermissionSet> {
        return this.client.revokePermissionFromRoleAsync({ resource, level, accessorId: roleId });
    }

    /**
     * Use email and password to log in a user
     *
     * @param email - The user email
     * @param password - The user password
     * @returns The logged in user
     */
    public login(email: string, password: string): Promise<User> {
        return this.client.loginAsync({ email, password });
    }

    /**
     * Check if JWT token is valid
     *
     * @param token - JWT token
     * @returns Response object
     */
    public isTokenValid(token: string): Promise<BooleanResponse> {
        return this.client.isValidAsync({ token });
    }

    /**
     * Check if user with JWT token can access requested resource with permission level
     *
     * @param resource - Resource to check permissions on
     * @param level - Level of access (1=Read,2=Write)
     * @param jwt - JWT token
     * @returns A boolean response
     */
    public canAccess(resource: string, level: 1 | 2, jwt: string): Promise<BooleanResponse> {
        return this.client.canAccessAsync({ resource, level, jwt });
    }

    /**
     * Log in as another user
     *
     * @param adminId - The admin id
     * @param userId  - Id of the user to log in as
     * @returns The logged in user
     */
    public loginAs(adminId: number, userId: number): Promise<User> {
        return this.client.loginAsAsync({ adminId, userId });
    }
}
