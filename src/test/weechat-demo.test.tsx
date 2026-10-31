import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DemoProvider, useDemo } from '@/components/weechat/provider';
import { formatCredits } from '@/lib/weechat/demo-data';
function DemoProbe() {
  const { locale, setLocale, t } = useDemo();
  return <><span data-testid="locale">{locale}</span><span>{t('login')}</span><button onClick={() => setLocale('en')}>English</button></>;
}
describe('Weechat locale', () => {
  it('switches the UI language', () => {
    render(<DemoProvider><DemoProbe /></DemoProvider>);
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
  it('formats credits without minute pricing', () => {
    expect(formatCredits(1250).replace(/\s/g, '')).toBe('1250');
  });
});
