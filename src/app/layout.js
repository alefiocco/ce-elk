import './globals.css'

export const metadata = {
  title: 'CE Riclassificato',
  description: 'Conto Economico Riclassificato a Valore Aggiunto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        {children}
      </body>
    </html>
  )
}
