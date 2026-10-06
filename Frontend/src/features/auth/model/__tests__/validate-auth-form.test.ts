import { validateAuthForm } from '../validate-auth-form';

const form = { name: 'Pessoa', email: 'a@b.c', password: '12345678', confPassword: '12345678' };

describe('When validating the sign up form', () => {
  it('should flag mismatched passwords and accept a valid form', () => {
    expect(validateAuthForm('cadastro', { ...form, confPassword: '87654321' })).toEqual(
      'As senhas não coincidem.',
    );
    expect(validateAuthForm('cadastro', form)).toBeNull();
    expect(validateAuthForm('login', { ...form, name: '' })).toBeNull();
  });
});
