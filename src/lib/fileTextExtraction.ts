export const ACCEPTED_MATERIALS = ".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp";
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function validateMaterialFile(file: File) {
  if (file.size > MAX_FILE_SIZE) throw new Error("Files must be 20 MB or smaller.");
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!ACCEPTED_MATERIALS.split(",").includes(extension)) throw new Error("Unsupported file. Upload PDF, PPT/PPTX, DOC/DOCX, TXT, Markdown, or an image.");
}

export async function extractPlainText(file: File) {
  if (/^text\//.test(file.type) || /\.(txt|md)$/i.test(file.name)) return file.text();
  return "";
}
