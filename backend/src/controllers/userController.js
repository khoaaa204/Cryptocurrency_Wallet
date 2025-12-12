import User from "../models/User.js";

// 1. Lấy danh sách danh bạ
export const getContacts = async (req, res) => {
  try {
    const { userId } = req.query; // Lấy ID từ URL
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật địa chỉ ví (Có kiểm tra trùng lặp)
export const updateWalletAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    
    // 1. Kiểm tra xem ví này đã có ai dùng chưa?
    // (Tìm user có address trùng với address gửi lên)
    const existingUser = await User.findOne({ address: address });

    // 2. Logic kiểm tra:
    // Nếu tìm thấy người dùng ví này VÀ người đó KHÔNG PHẢI là người đang đăng nhập
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(409).json({ // 409 Conflict
        message: `⛔ Ví này đã được liên kết với tài khoản: ${existingUser.email}. Vui lòng chọn ví khác!` 
      });
    }
    
    // 3. Nếu ví chưa ai dùng, hoặc là của chính mình -> Cho phép update
    const user = await User.findByIdAndUpdate(
      userId, 
      { address: address }, 
      { new: true } // Trả về data mới
    );

    res.json({ message: "Liên kết ví thành công!", user });
  } catch (error) {
    console.error("Lỗi update ví:", error);
    res.status(500).json({ message: "Lỗi server update ví" });
  }
};

// 2. Thêm liên hệ mới
export const addContact = async (req, res) => {
  try {
    const { userId, name, address } = req.body;
    
    const user = await User.findById(userId);
    // Thêm vào mảng contacts
    user.contacts.push({ name, address });
    await user.save();

    res.json({ message: "Đã thêm liên hệ", contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm liên hệ" });
  }
};

// 3. Xóa liên hệ
export const deleteContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;
    
    await User.updateOne(
      { _id: userId },
      { $pull: { contacts: { _id: contactId } } } // Lệnh $pull giúp xóa phần tử khỏi mảng
    );

    res.json({ message: "Đã xóa liên hệ" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa liên hệ" });
  }
};