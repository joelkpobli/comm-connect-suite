import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DemoProvider, useDemo } from '@/components/weechat/provider';
import { formatCredits } from '@/lib/weechat/demo-data';
function DemoProbe() {
  const { balance, transactions, purchase, locale, setLocale, t } = useDemo();
  return <><span data-testid="balance">{balance}</span><span data-testid="transactions">{transactions.length}</span><span data-testid="locale">{locale}</span><span>{t('login')}</span><button onClick={() => purchase(2500, 'Explorateur')}>Purchase</button><button onClick={() => setLocale('en')}>English</button></>;
}
describe('Local Weechat simulation', () => {
  it('adds fictional credits and an in-memory transaction', () => {
    render(<DemoProvider><DemoProbe /></DemoProvider>);
    expect(screen.getByTestId('balance')).toHaveTextContent('1250');
    fireEvent.click(screen.getByText('Purchase'));
    expect(screen.getByTestId('balance')).toHaveTextContent('3750');
    expect(screen.getByTestId('transactions')).toHaveTextContent('6');
  });
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
