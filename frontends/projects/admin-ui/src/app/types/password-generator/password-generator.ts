export const DIGITS = '01234567689';
export const LOWER_CASES = 'abcdefghijklmnopqrstuvwxyz';
export const SPECIAL_CHARS = '!§/[]{}=?,;:.-_+*#~';
export const UPPER_CASES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const RULE_UPPER_LOWER_DIGITS_SPECIAL = [
  UPPER_CASES,
  LOWER_CASES,
  DIGITS,
  SPECIAL_CHARS,
];

export class PasswordGenerator {

  /**
   * Generates a new password.
   * @param length Password lenth.
   * @param rule Rules to apply.
   * @returns Generated password.
   */
  static generatePassword(length: number = 20, rule: string[] = RULE_UPPER_LOWER_DIGITS_SPECIAL): string {
    const alphabet = rule.join();
    while (true) {
      let password = '';
      for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * alphabet.length);
        password += alphabet[index == alphabet.length ? alphabet.length - 1 : index];
      }
      if (this.validatePassword(password, rule)) {
        return password;
      } else {
        continue;
      }
    }
  }

  /**
   * Validates if a password applies specified rules.
   * @param password Password to validate.
   * @param rule Rules to validate.
   * @returns true = valid, false = invalid.
   */
  static validatePassword(password: string, rule: string[]): boolean {
    const chars = password.split('');
    const allowedChars = rule.join('');
    // Verify that password contains only valid characters.
    for (let c of chars) {
      const ruleIndex = allowedChars.indexOf(c);
      if (ruleIndex < 0) {
        return false;
      }
    }
    // Verify that password contains at least one character of each rule.
    for (let r of rule) {
      let index = -1;
      for (let c of r) {
        const i = password.indexOf(c);
        if (i >= 0) {
          index = i;
          break;
        }
      }
      if (index < 0) {
        return false;
      }
    }
    return true;
  }
}
