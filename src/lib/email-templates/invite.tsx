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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <AuthEmailLayout siteName={siteName} preview={`Vous êtes invité à rejoindre ${siteName}`}>
    <Heading style={heading}>Votre invitation Weechat</Heading>
    <Text style={text}>
      Vous êtes invité à rejoindre{' '}
      <Link href={siteUrl} style={link}>
        <strong>{siteName}</strong>
      </Link>
      . Cliquez sur le bouton ci-dessous pour accepter l’invitation et créer votre compte.
    </Text>
    <Button className="dm-btn" style={button} href={confirmationUrl}>
      Accepter l’invitation
    </Button>
    <Text style={footerNote}>
      Si vous n’attendiez pas cette invitation, vous pouvez ignorer cet e-mail en toute sécurité.
    </Text>
  </AuthEmailLayout>
)

export default InviteEmail
