import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // Nếu muốn bắt buộc phải có email thì để true, nếu cho phép login chỉ bằng ví thì để false
    required: true, 
    unique: true, 
  },
  password: {
    type: String,
    // Password bắt buộc với email, nhưng nếu login bằng ví thì có thể không cần
    // Tạm thời để required: false hoặc xử lý logic bên controller
    required: false, 
  },
  
  // --- SỬA ĐOẠN NAY ---
  address: {
    type: String,
    required: false, // <--- Đổi từ true thành false (quan trọng)
    unique: true,    // Giữ unique để 1 ví chỉ gắn với 1 tk
    sparse: true,    // Cho phép nhiều user có address là null (quan trọng khi unique: true)
  },
  nonce: {
    type: String,
    required: false, // <--- Đổi từ true thành false
    default: () => Math.floor(Math.random() * 1000000).toString(), // Tự động tạo số ngẫu nhiên nếu không có
  },
  // --------------------
}, { timestamps: true });

export default mongoose.model("User", userSchema);