import { login_account_repository } from "@/bot/backend/repositories/accounts/login-account-repository";

interface LoginAccountInput {
    telegram_id: string;
    name: string;
    password: string;
}

async function login_account_controller({ telegram_id, name, password }: LoginAccountInput): Promise<string> {
    const result = await login_account_repository({ telegram_id, name, password });

    switch (result.status) {
        case "ok":
            return `✅ Agora você está na conta *${result.name}*!\n\nTodas as receitas e despesas usarão esta conta.`;
        case "wrong_password":
            return "❌ Senha incorreta.";
        case "not_found":
            return "❌ Conta não encontrada.";
        case "user_not_found":
            return "❌ Usuário não encontrado. Use /start primeiro.";
    }
}

export { login_account_controller };
