export const success = (res, data) => res.json({ success: true, data });
export const fail = (res, message, code = 400) => res.status(code).json({ success: false, message });
