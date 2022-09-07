export interface User {
    id: number | undefined;
    name: string | undefined;
    identityProviderId: string | undefined;
    roles: [{ id: string, name: string }] | undefined;
}
