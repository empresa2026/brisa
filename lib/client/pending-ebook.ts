/** Guarda o PDF entre a tela de input e o workspace (navegação client-side mantém o módulo vivo). */
let pending: { id: string; file: File } | null = null;

export function setPendingEbook(id: string, file: File) {
  pending = { id, file };
}

export function takePendingEbook(id: string): File | null {
  if (pending?.id !== id) return null;
  const f = pending.file;
  pending = null;
  return f;
}
