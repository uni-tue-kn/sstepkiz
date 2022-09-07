import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../environments/environment';
import { PasswordGenerator } from '../../types/password-generator/password-generator';
import { SNACK_BAR_SUCCESS_DURATION } from '../../types/snackbar-durations';

@Component({
  selector: 'app-create-user-dialog',
  styleUrls: ['./create-user-dialog.component.scss'],
  templateUrl: './create-user-dialog.component.html',
})
export class CreateUserDialogComponent {

  /**
   * List of all available groups.
   */
  readonly allGroups = [
    'administrator',
    'patient',
    'therapist',
  ];

  /**
   * Result data.
   */
  get data(): { username: string, password: string, group: string } {
    return this.userForm.value;
  }

  /**
   * Indicates if password is hidden.
   */
  hidePassword: boolean = true;

  readonly passwordDefaultLength = environment.passwordPolicy.defaultLength;
  readonly passwordMaxLength = environment.passwordPolicy.maxLength;
  readonly passwordMinLength = environment.passwordPolicy.minLength;
  readonly passwordRule: { allowedChars: string, name: string }[] = environment.passwordPolicy.rule;
  readonly passwordSpecialChars = environment.passwordPolicy.specialChars;

  readonly usernameMaxLength = environment.usernamePolicy.maxLength;
  readonly usernameMinLength = environment.usernamePolicy.minLength;
  readonly usernamePattern = environment.usernamePolicy.pattern;

  /**
   * User form.
   */
  readonly userForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [
      Validators.maxLength(this.usernameMaxLength),
      Validators.minLength(this.usernameMinLength),
      Validators.pattern(this.usernamePattern),
      Validators.required,
    ]),
    password: new UntypedFormControl(PasswordGenerator.generatePassword(this.passwordDefaultLength, this.passwordRule.map(r => r.allowedChars)), [
      Validators.maxLength(this.passwordMaxLength),
      Validators.minLength(this.passwordMinLength),
      ...this.passwordRule.map(rule => {
        const regex = `^.*[${rule.allowedChars.split('').map(c => '\\*+?|{[()^$.# '.split('').indexOf(c) >= 0 ? `\\${c}` : c).join('|')}]+.*$`;
        return this.regexValidator(
          new RegExp(regex),
          { [rule.name]: true },
        );
      }),
      Validators.pattern(`[${this.passwordRule.map(r => r.allowedChars.split('').map(c => `\\${c}`).join('')).join('|')}]*`),
      Validators.required,
    ]),
    group: new UntypedFormControl('patient', [
      Validators.pattern(this.allGroups.map(g => `[${g}]`).join('|')),
      Validators.required,
    ]),
  });

  /**
   * Constructs a user creation dialog.
   * @param dialogRef Dialog reference.
   * @param snackBar Snack bar instance.
   */
  constructor(
    private readonly dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private readonly snackBar: MatSnackBar,
  ) { }

  /**
   * Clears username field.
   */
  clearUsername(): void {
    this.userForm.controls.username.setValue('');
  }

  /**
   * Copy password to clipboard.
   */
  copyPassword(): void {
    navigator.clipboard.writeText(this.userForm.controls.password.value);
    this.snackBar.open('Password copied to clipboard', 'Dismiss', {
      duration: SNACK_BAR_SUCCESS_DURATION,
    });
  }

  /**
   * Generate a new password and insert to password field.
   */
  generatePassword(): void {
    this.userForm.controls.password.setValue(PasswordGenerator.generatePassword(this.passwordDefaultLength, this.passwordRule.map(r => r.allowedChars)));
    this.snackBar.open('New password generated', 'Dismiss', {
      duration: SNACK_BAR_SUCCESS_DURATION,
    });
  }

  /**
   * Generates a regular expression validation function.
   * @param regex Regular expression.
   * @param error Error to show.
   * @returns Validation function.
   */
  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    }
  }

  /**
   * Submits the form.
   */
  submit() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.data);
    }
  }

  /**
   * Toggles password visibility.
   */
  toggleHidePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}
