import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Đường dẫn: /api/admin/users
// protect: Phải đăng nhập
// adminOnly: Phải là admin
router.get('/users', protect, adminOnly, getAllUsers);

// Đường dẫn: /api/admin/users/:id
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;