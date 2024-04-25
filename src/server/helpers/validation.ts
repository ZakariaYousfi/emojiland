import { zfd } from "zod-form-data"
import { z } from "zod"

export const formSchema = zfd.formData({
    Tweet: zfd.text(z.string().emoji("Only emojis are allowed").min(1, "Too short").max(280, "Too long"))
})