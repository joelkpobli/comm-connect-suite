import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { packLabel?: string; provider?: string; lines?: string[]; reference?: string }

const Email = ({ packLabel, provider, lines, reference }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre achat {packLabel ?? 'Weechat'} est crédité</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Weechat</Text>
        <Heading style={h1}>Paiement confirmé</Heading>
        <Text style={text}>Merci ! Votre achat <strong>{packLabel ?? 'Weechat'}</strong> a bien été reçu{provider ? ` via ${provider}` : ''} et crédité sur votre compte.</Text>
        {lines && lines.length > 0 ? (
          <Section style={box}>{lines.map((l) => <Text key={l} style={item}>• {l}</Text>)}</Section>
        ) : null}
        <Button href="https://www.weechat.online/tableau-de-bord" style={button}>Ouvrir mon tableau de bord</Button>
        <Hr style={hr} />
        {reference ? <Text style={small}>Référence : {reference}</Text> : null}
        <Text style={small}>Une question ? Écrivez-nous sur WhatsApp : +229 01 57 68 59 35</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Paiement confirmé — ${d['packLabel'] ?? 'Weechat'}`,
  displayName: 'Reçu de paiement',
  previewData: { packLabel: 'Pack Découverte', provider: 'SebPay', lines: ['1 000 points', '10 minutes de traduction'], reference: 'sebpay:test123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '560px' }
const brand = { color: '#0f766e', fontSize: '18px', fontWeight: 700, margin: '0 0 16px' }
const h1 = { color: '#0f172a', fontSize: '24px', margin: '0 0 12px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const box = { backgroundColor: '#f0fdfa', borderRadius: '10px', padding: '8px 16px', margin: '16px 0' }
const item = { color: '#0f172a', fontSize: '15px', margin: '6px 0' }
const button = { backgroundColor: '#0f766e', color: '#ffffff', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0 12px' }
const small = { color: '#64748b', fontSize: '12px', lineHeight: '18px' }
