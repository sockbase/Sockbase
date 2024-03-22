interface IUseClipboard {
  copyToClipboardAsync: (data: string) => Promise<void>
}
const useClipboard = (): IUseClipboard => {
  const copyToClipboardAsync = async (data: string): Promise<void> => {
    await navigator.clipboard.writeText(data)
  }

  return {
    copyToClipboardAsync
  }
}

export default useClipboard
