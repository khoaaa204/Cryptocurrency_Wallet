import User from "../models/User.js";

// Lấy danh sách tất cả User
export const getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả user nhưng trừ trường password ra
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Xóa một User (Bị ban hoặc vi phạm)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id }); // Dùng deleteOne thay vì remove
      res.json({ message: "Đã xóa người dùng thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server khi xóa" });
  }
};