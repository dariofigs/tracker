/**
 * Hands a text file to the user. On a phone that supports it, the share sheet opens so the file can go
 * to Files or Drive; otherwise the browser downloads it. Returns false if the user cancelled the share.
 */
export async function saveTextFile(
  name: string,
  content: string,
  mime: string,
): Promise<boolean> {
  const file = new File([content], name, { type: mime })

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false
      // Share failed for another reason: fall back to a normal download.
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}
