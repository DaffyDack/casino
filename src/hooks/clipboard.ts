import c from 'copy-to-clipboard'
import { copyImageToClipboard } from 'copy-image-clipboard'
import { useNotify } from '@/hooks/notify'
import { i18n } from '@/plugins/i18n'

export function useClipboard() {
  const notify = useNotify()

  const write = (text: string) => {
    try {
      c(text)
      notify(i18n.global.t('copiedToClipboard'), 'success', { life: 1000 })
    } catch (ex) {
      console.error(ex)
      notify(i18n.global.t('copyToClipboardError'), 'error')
    }
  }

  const writeImage = async (fileUrl: string) => {
    try {
      await copyImageToClipboard(fileUrl)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    write,
    writeImage,
  }
}
