/** Site owner / admin login must never appear as a row in farmer user lists. */
const DEFAULT_OWNER_EMAIL = "admin@smartagri.com";

export function isFarmerAccountUser(record) {
  if (!record) return false;
  if (record.role === "admin") return false;
  if (record.role !== "user") return false;
  const em = String(record.email || "").trim().toLowerCase();
  if (em === DEFAULT_OWNER_EMAIL.toLowerCase()) return false;
  return true;
}

export function filterFarmerUsers(list) {
  return (list || []).filter(isFarmerAccountUser);
}
