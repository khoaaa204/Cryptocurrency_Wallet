# Crypto Wallet Backend

Yêu cầu:
- Node.js 18+ (v16+ có hỗ trợ ESM nhưng prefer 18+)
- MongoDB (local or Atlas)

Cài đặt:
1. tạo file .env từ .env.example và chỉnh thông tin
2. npm install
3. npm run dev

API Endpoints:
- GET  /api/auth/nonce/:address
- POST /api/auth/login           -> body { address, signature } -> trả { token, user }
- POST /api/wallet/transaction   -> (Authorization: Bearer <token>) body { hash, from, to, amount, token, status }
- GET  /api/wallet/transactions/:address

Gợi ý:
- Frontend nên gọi /auth/nonce/:address trước khi yêu cầu user sign.
- Sau login, frontend dùng token để gọi endpoint bảo vệ (POST /wallet/transaction).
