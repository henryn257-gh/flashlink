export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error("Clipboard access is not supported.");
  }

  await navigator.clipboard.writeText(text);
}
