import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { AuthEmailLayout, button, footerNote, heading, text } from './auth-email-layout'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <AuthEmailLayout siteName={siteName} preview={`Réinitialisez votre mot de passe ${siteName}`}>
    <Heading style={heading}>Réinitialisez votre mot de passe</Heading>
    <Text style={text}>
      Nous avons reçu une demande de réinitialisation du mot de passe de votre compte {siteName}.
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </Text>
    <Button className="dm-btn" style={button} href={confirmationUrl}>
      Choisir un nouveau mot de passe
    </Button>
    <Text style={footerNote}>
      Si vous n’avez pas fait cette demande, ignorez cet e-mail. Votre mot de passe actuel restera inchangé.
    </Text>
  </AuthEmailLayout>
)

export default RecoveryEmail
