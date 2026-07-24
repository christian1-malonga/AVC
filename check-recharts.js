const r = require("recharts");
const keys = Object.keys(r);
const svg = keys.filter((k) => /Defs|LinearGradient|RadialGradient|Stop|Defs/igm.test(k));
console.log("SVG/Gradient exports:", svg.length ? svg.join(", ") : "NONE");
console.log("Total recharts exports:", keys.length);
