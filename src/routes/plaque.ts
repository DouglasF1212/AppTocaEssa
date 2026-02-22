import { Hono } from "hono"
import template from "../templates/plaque.html?raw"
import { getPublicR2Url } from "../lib/r2"

const plaque = new Hono()

plaque.get("/:slug", async (c) => {
  const slug = c.req.param("slug")

  // TODO: substituir por busca real no banco
  const artist = {
    name: "Douglas Felipe",
    instagram: "douglasfelipecantor",
    photoKey: `artists/${slug}/photo.jpg`,
    qrKey: `artists/${slug}/qr.png`
  }

  const html = template
    .replace("{{ARTIST_NAME}}", artist.name)
    .replace("{{INSTAGRAM}}", artist.instagram)
    .replace("{{PHOTO_URL}}", getPublicR2Url(artist.photoKey))
    .replace("{{QR_CODE_URL}}", getPublicR2Url(artist.qrKey))

  return c.html(html)
})

export default plaque