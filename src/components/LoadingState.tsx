export function LoadingState({ error = '' }: { error?: string }) {
  return (
    <main className="center-state" role={error ? 'alert' : 'status'}>
      <img src={`${import.meta.env.BASE_URL}images/gfm_logo.png`} width="96" height="96" alt="" />
      <strong>{error || 'Preparing the hymn catalogue…'}</strong>
      <span>{error ? 'Reload the application and try again.' : 'English and Yoruba worship resources are loading.'}</span>
    </main>
  )
}
