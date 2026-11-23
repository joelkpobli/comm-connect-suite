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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <AuthEmailLayout siteName={siteName} preview={`Confirmez votre adresse e-mail pour ${siteName}`}>
    <Heading style={heading}>Confirmez votre adresse e-mail</Heading>
    <Text style={text}>
      Merci d’avoir créé votre compte{' '}
      <Link href={siteUrl} style={link}>
        <strong>{siteName}</strong>
      </Link>
      .
    </Text>
    <Text style={text}>
      Pour activer votre compte, confirmez votre adresse (
      <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
      ) en cliquant sur le bouton ci-dessous.
    </Text>
    <Button className="dm-btn" style={button} href={confirmationUrl}>
      Confirmer mon adresse e-mail
    </Button>
    <Text style={footerNote}>
      Si vous n’avez pas créé de compte, vous pouvez ignorer cet e-mail en toute sécurité.
    </Text>
  </AuthEmailLayout>
)

export default SignupEmail
