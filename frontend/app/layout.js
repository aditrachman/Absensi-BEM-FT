import './globals.css'
import { Lexend_Deca } from 'next/font/google'

const lexendDeca = Lexend_Deca({ 
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-lexend'
})

export const metadata = {
    title: 'Sistem Absensi BEM',
    description: 'Sistem Absensi Digital BEM Fakultas Teknik UNIMMA',
    themeColor: '#165DFF'
}

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body className={lexendDeca.className}>{children}</body>
        </html>
    )
}
