import bcrypt from "bcryptjs";

const hashed = "$2a$10$/cShkMxDfxolV3JFxEcGkuK1Cc3kpDDJWsO3//hXChXcgfvoqypz6"; // Copy password hash from MongoDB
const isMatch = await bcrypt.compare("Virat@18", hashed);
console.log(isMatch); // should be true

