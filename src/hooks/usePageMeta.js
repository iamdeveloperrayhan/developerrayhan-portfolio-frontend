import { useEffect } from 'react'

const BASE_TITLE = 'DevFolio'

// Sets document.title and meta description per page (lightweight SEO).
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : `${BASE_TITLE} — Full-Stack Developer`
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}
