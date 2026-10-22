import { Request, Response, Router } from "express";
import { getAuthSecret, TOKEN_TTL_SECONDS } from "../../auth/config";
import { verifyPassword } from "../../auth/password";
import { createToken } from "../../auth/token";
import { findAdminByUsername } from "../../db/adminActions";
import { ApiResponse } from "../../type/api";
import { AdminDocument, AdminLoginInput, LoginResult } from "../../type/admin";
import { handleDbError, sendError } from "../http";
import { ParseResult, parseLoginInput } from "../validation";

export const adminRouter: Router = Router();

// Compared when the username does not exist, so both failures cost the same time
const DUMMY_HASH: string = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;
const INVALID_LOGIN_MESSAGE: string = "Invalid username or password";

adminRouter.post(
    "/login",
    async (req: Request<Record<string, never>, ApiResponse<LoginResult>, unknown>, res: Response<ApiResponse<LoginResult>>): Promise<void> => {
        const parsed: ParseResult<AdminLoginInput> = parseLoginInput(req.body);
        if (!parsed.ok) {
            sendError(res, 400, parsed.errors.join("; "));
            return;
        }

        try {
            const admin: AdminDocument | null = await findAdminByUsername(parsed.value.username);
            const isPasswordCorrect: boolean = await verifyPassword(parsed.value.password, admin?.passwordHash ?? DUMMY_HASH);
            if (admin === null || !isPasswordCorrect) {
                sendError(res, 401, INVALID_LOGIN_MESSAGE);
                return;
            }

            const { token, expiresAt } = createToken(admin.username, TOKEN_TTL_SECONDS, getAuthSecret());
            res.status(200).json({ success: true, data: { token, username: admin.username, expiresAt: expiresAt.toISOString() } });
        } catch (error: unknown) {
            handleDbError(res, error, "Login failed. Please try again.");
        }
    }
);
