import { UserModel } from '../modules/users/model.js'

export const TitleToSlug = (title) => {
  if (!title) return ''
  if (title) {
    let slug = title.toLowerCase().trim()

    slug = slug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    slug = slug.replace(/-+/g, '-')

    slug = slug.replace(/-$/g, '').startsWith('_') ? slug.replace('-', '') : slug.replace(/-$/g, '')

    return slug.trim()
  } else {
    return ''
  }
}



export async function generateUniqueUsername(proposedName) {
  let username = TitleToSlug(proposedName)
  try {
    const data = await UserModel.findOne({ username })
    if (data) {
      username += Math.floor(Math.random() * 100 + 1)
      return generateUniqueUsername(username)
    }
    return username
  } catch (error) {
    return ''
  }
}
