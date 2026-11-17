export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return <div className="state"><span className="spinner" />{text}</div>
}
export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="alert error"><strong>Erro</strong><span>{message}</span>{onRetry && <button className="button" onClick={onRetry}>Tentar novamente</button>}</div>
}
export function Empty({ text }: { text: string }) {
  return <div className="state empty"><strong>Nenhum resultado</strong><span>{text}</span></div>
}
