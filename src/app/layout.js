export const metadata = {
  title: 'CE Riclassificato',
  description: 'Conto Economico Riclassificato a Valore Aggiunto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{margin:0,padding:0,background:'#0f1117'}}>
        {children}
      </body>
    </html>
  )
}
