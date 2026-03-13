import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp") // ✅ This folder must exist — created manually
  },
  filename: function (req, file, cb) {
    // ✅ No spaces in filename — spaces break some OS file lookups
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    cb(null, uniqueName)
  },
})

export const upload = multer({ storage })
