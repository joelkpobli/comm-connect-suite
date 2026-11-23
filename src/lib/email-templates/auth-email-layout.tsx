import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AuthEmailLayoutProps {
  siteName: string
  preview: string
  children: React.ReactNode
}

export const AuthEmailLayout = ({ siteName, preview, children }: AuthEmailLayoutProps) => (
  <Html lang="fr" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          <span style={brandMark}>W</span>
          {' '}{siteName}
        </Text>
        <Section style={card}>{children}</Section>
        <Hr style={hr} />
        <Text style={footer}>
          Cet e-mail concerne la sécurité de votre compte {siteName}.
        </Text>
        <Text style={footer}>
          Besoin d’aide ? Contactez-nous sur WhatsApp : +229 01 57 68 59 35
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 20px',
}

const brand = {
  color: '#070B12',
  fontSize: '22px',
  fontWeight: 750,
  margin: '0 0 20px',
}

const brandMark = {
  display: 'inline-block',
  width: '32px',
  height: '32px',
  lineHeight: '32px',
  textAlign: 'center' as const,
  borderRadius: '8px',
  backgroundColor: '#070B12',
  color: '#19B5FE',
  marginRight: '8px',
}

const card = {
  backgroundColor: '#ffffff',
  border: '1px solid #dce8f0',
  borderRadius: '12px',
  padding: '28px',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0 16px',
}

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 6px',
}

export const heading = {
  color: '#070B12',
  fontSize: '24px',
  lineHeight: '32px',
  fontWeight: 700,
  margin: '0 0 18px',
}

export const text = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

export const link = {
  color: '#087cae',
  textDecoration: 'underline',
}

export const button = {
  backgroundColor: '#19B5FE',
  color: '#070B12',
  border: '1px solid #19B5FE',
  borderRadius: '8px',
  padding: '13px 20px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
}

export const footerNote = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '26px 0 0',
}

export const codeStyle = {
  backgroundColor: '#eaf7ff',
  border: '1px solid #b8e5fd',
  borderRadius: '8px',
  color: '#070B12',
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '6px',
  textAlign: 'center' as const,
  padding: '16px',
  margin: '0 0 24px',
}

// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #19B5FE !important; color: #070B12 !important; }
  }
  [data-ogsc] .dm-btn { background-color: #19B5FE !important; color: #070B12 !important; }
  [data-ogsb] .dm-btn { background-color: #19B5FE !important; color: #070B12 !important; }
`
