export type UserProfileToken = {
    data: any;
    userName: string;
    email: string;
    roles: string[];
    accessToken: string;
}

export type UserProfile = {
    userName: string;
    email: string;
    roles: string[];
}