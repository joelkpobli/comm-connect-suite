import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { AuthEmailLayout, button, footerNote, heading, text } from './auth-email-layout'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <AuthEmailLayout siteName={siteName} preview={`Votre lien de connexion à ${siteName}`}>
    <Heading style={heading}>Votre lien de connexion</Heading>
    <Text style={text}>
      Cliquez sur le bouton ci-dessous pour vous connecter à {siteName}. Ce lien expirera dans quelques instants.
    </Text>
    <Button className="dm-btn" style={button} href={confirmationUrl}>
      Me connecter à Weechat
    </Button>
    <Text style={footerNote}>
      Si vous n’avez pas demandé ce lien, vous pouvez ignorer cet e-mail en toute sécurité.
    </Text>
  </AuthEmailLayout>
)

export default MagicLinkEmail
