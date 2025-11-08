import { SignupCoiffeurRequest, SignupClientRequest, LoginRequest } from '../types/auth';
export declare class AuthService {
    static signupCoiffeur(data: SignupCoiffeurRequest): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            user_type: "coiffeur";
            salon_id: any;
        };
    }>;
    static signupClient(data: SignupClientRequest): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            user_type: "client";
        };
    }>;
    static login(data: LoginRequest): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            user_type: any;
            salon_id: string | undefined;
        };
    }>;
    static getCurrentUser(token: string): Promise<{
        id: any;
        email: any;
        user_type: any;
        salon_id: any;
    }>;
    private static generateJWT;
    static refreshToken(oldToken: string): Promise<{
        access_token: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map