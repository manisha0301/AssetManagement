const assetTypePrefixes = {
  Laptop: "LAP",
  Pendrive: "PEN",
  Phone: "PHN",
  "Data Cable": "DTC",
  Charger: "CHR",
};

function getPrefix(type) {
  if (!type) return "AST";

  const normalized = String(type).trim().toLowerCase();

  if (normalized === "employee") return "EMP";
  if (normalized === "asset") return "AST";

  return normalized.slice(0, 3).toUpperCase() || "AST";
}

function getAssetPrefix(assetType) {
  if (!assetType) return "AST";

  return assetTypePrefixes[assetType] || "AST";
}

function generateNextId(prefix, rows, columnName) {
  const highest = rows.reduce((max, row) => {
    const rawValue = row[columnName] || "";
    if (!rawValue.startsWith(prefix)) return max;

    const numericPart = Number.parseInt(rawValue.slice(prefix.length), 10);
    if (Number.isNaN(numericPart)) return max;

    return Math.max(max, numericPart);
  }, 0);

  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

module.exports = {
  getPrefix,
  getAssetPrefix,
  generateNextId,
};
