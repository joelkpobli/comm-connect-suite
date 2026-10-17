import { describe, expect, it } from 'vitest';
import { initiatePayment, paymentBlockers } from '@/lib/weechat/payment-contracts';
describe('Disabled payment architecture', () => {
 it('cannot initiate payments', () => { expect(() => initiatePayment()).toThrow('Payments are not enabled'); });
 it('always blocks enablement even when future requirements are filled', () => { expect(paymentBlockers({merchantCountry:'FR',currency:'EUR',catalogue:[{id:'approved-test-item',currency:'EUR',priceMinor:100,credits:10}],providerApproved:true,testVerified:true})).toEqual(['payments_not_enabled']); });
 it('requires actual approved merchant/catalogue/provider/test information', () => { expect(paymentBlockers({providerApproved:false,testVerified:false})).toEqual(['payments_not_enabled','merchant_country_required','currency_required','approved_catalogue_required','provider_review_required','verified_test_flow_required']); });
 it('rejects incompatible catalogue currency', () => { expect(paymentBlockers({merchantCountry:'FR',currency:'EUR',catalogue:[{id:'x',currency:'USD',priceMinor:100,credits:10}],providerApproved:true,testVerified:true})).toContain('approved_catalogue_required'); });
});
