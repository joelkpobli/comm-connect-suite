import * as React from 'react'
import { Heading, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  codeStyle,
  footerNote,
  heading,
  text,
} from './auth-email-layout'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AuthEmailLayout siteName="Weechat" preview="Votre code de vérification Weechat">
    <Heading style={heading}>Confirmez votre identité</Heading>
    <Text style={text}>Utilisez le code ci-dessous pour confirmer votre identité :</Text>
    <Text style={codeStyle}>{token}</Text>
    <Text style={footerNote}>
      Ce code expirera dans quelques instants. Si vous n’avez pas fait cette demande, vous pouvez ignorer cet e-mail.
    </Text>
  </AuthEmailLayout>
)

export default ReauthenticationEmail
