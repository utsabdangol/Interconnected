export interface UserProfileToken {
    success: boolean;
    message?: string;
    token?: string;
    user?: any;
    // Add other properties as needed based on the backend response
    [key: string]: any;
}

export interface User {
    id: string;
    username: string;
    email: string;
}
