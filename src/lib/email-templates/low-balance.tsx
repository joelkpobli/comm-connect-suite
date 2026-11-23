import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { service?: 'audio' | 'swap_live'; balanceLabel?: string; minutesLeft?: number }

const Email = ({ service, balanceLabel, minutesLeft }: Props) => {
  const audio = service === 'audio'
  const what = audio ? 'vos minutes de traduction vocale' : 'vos points Swap Live'
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Votre solde Weechat est bientôt épuisé</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Weechat</Text>
          <Heading style={h1}>Votre solde est bientôt épuisé</Heading>
          <Text style={text}>Pendant votre dernier appel, {what} sont passés sous le seuil d'alerte.</Text>
          <Text style={box}>Solde restant : <strong>{balanceLabel ?? '—'}</strong>{typeof minutesLeft === 'number' ? ` (environ ${minutesLeft} min d'utilisation)` : ''}</Text>
          <Text style={text}>Rechargez maintenant pour que votre prochain appel ne soit pas interrompu. Paiement par Mobile Money ou carte bancaire.</Text>
          <Button href="https://www.weechat.online/credits" style={button}>Recharger mon solde</Button>
          <Hr style={hr} />
          <Text style={small}>Vous recevez ce message au plus une fois par jour, uniquement quand votre solde devient faible.</Text>
          <Text style={small}>Une question ? Écrivez-nous sur WhatsApp : +229 01 57 68 59 35</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => d['service'] === 'audio' ? 'Vos minutes de traduction sont bientôt épuisées' : 'Vos points Weechat sont bientôt épuisés',
  displayName: 'Alerte solde faible',
  previewData: { service: 'swap_live', balanceLabel: '100 points', minutesLeft: 0 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '560px' }
const brand = { color: '#0f766e', fontSize: '18px', fontWeight: 700, margin: '0 0 16px' }
const h1 = { color: '#0f172a', fontSize: '24px', margin: '0 0 12px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const box = { backgroundColor: '#fff7ed', borderRadius: '10px', padding: '12px 16px', margin: '16px 0', color: '#9a3412', fontSize: '15px' }
const button = { backgroundColor: '#0f766e', color: '#ffffff', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0 12px' }
const small = { color: '#64748b', fontSize: '12px', lineHeight: '18px' }
