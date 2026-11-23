import * as React from 'react'
import { Button, Heading, Link, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  button,
  footerNote,
  heading,
  link,
  text,
} from './auth-email-layout'

interface EmailChangeEmailProps {
  siteName: string
  // For the new-recipient half of a secure email_change fanout, `email` is
  // the new address. Rendering oldEmail here keeps the change accurate.
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <AuthEmailLayout siteName={siteName} preview={`Confirmez votre changement d’adresse e-mail ${siteName}`}>
    <Heading style={heading}>Confirmez votre nouvelle adresse e-mail</Heading>
    <Text style={text}>
      Vous avez demandé à remplacer l’adresse e-mail de votre compte {siteName}{' '}
      <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}
      par{' '}
      <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
    </Text>
    <Text style={text}>Cliquez sur le bouton ci-dessous pour confirmer ce changement.</Text>
    <Button className="dm-btn" style={button} href={confirmationUrl}>
      Confirmer le changement
    </Button>
    <Text style={footerNote}>
      Si vous n’avez pas demandé ce changement, sécurisez immédiatement votre compte.
    </Text>
  </AuthEmailLayout>
)

export default EmailChangeEmail
