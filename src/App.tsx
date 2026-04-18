import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function Placeholder() {
  return (
    <main style={{ padding: '48px', maxWidth: '720px', margin: '0 auto' }}>
      <h1>Missing Podo — Investigation Dashboard</h1>
      <p style={{ marginTop: '12px' }}>
        Setup complete. Data layer and UI arrive in the next steps.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Placeholder />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
