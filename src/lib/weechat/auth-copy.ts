import type { Locale } from './i18n';
const english: Record<string, string> = {
  "Confirmez d’abord votre e-mail via le lien reçu.": "Confirm your email using the link you received.",
  "E-mail ou mot de passe incorrect.": "Incorrect email or password.",
  "Adresse e-mail refusée. Vérifiez-la.": "Email address rejected. Please check it.",
  "Un compte existe déjà avec cet e-mail.": "An account already exists with this email.",
  "Trop de tentatives. Réessayez dans quelques minutes.": "Too many attempts. Try again in a few minutes.",
  "Mot de passe refusé : choisissez-en un plus robuste (8 caractères minimum).": "Password rejected: choose a stronger password (at least 8 characters).",
  "Une erreur est survenue. Réessayez.": "Something went wrong. Please try again.",
  "Les mots de passe ne correspondent pas.": "Passwords do not match.",
  "Compte créé. Ouvrez le lien envoyé par e-mail pour confirmer votre adresse, puis connectez-vous.": "Account created. Open the email link to confirm your address, then sign in.",
  "Si un compte existe pour cet e-mail, un lien de réinitialisation vient d’être envoyé.": "If an account exists for this email, a password reset link has been sent.",
  "Lien expiré ou invalide. Demandez un nouveau lien.": "Expired or invalid link. Request a new one.",
  "Nouveau mot de passe": "New password",
  "Choisissez un nouveau mot de passe.": "Choose a new password.",
  "Enregistrer": "Save",
  "Patientez…": "Please wait…",
  "CHAQUE CONVERSATION EST UN DÉPART.": "EVERY CONVERSATION IS A BEGINNING.",
  "Moins de barrières.": "Fewer barriers.",
  "Plus de connexions.": "More connections.",
  "Votre monde ne s’arrête pas à votre langue.": "Your world goes beyond your language.",
  "Masquer le mot de passe": "Hide password",
  "Afficher le mot de passe": "Show password",
  "Votre mot de passe": "Your password",
  "Confirmez votre mot de passe": "Confirm your password",
  "Vos données de connexion sont protégées.": "Your sign-in details are protected."
};
export function authCopy(text: string, locale: Locale) { return locale === 'en' ? english[text] ?? text : text; }
