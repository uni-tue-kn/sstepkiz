import { Component, Inject } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../environments/environment';
import { PasswordGenerator } from '../../types/password-generator/password-generator';
import { SNACK_BAR_SUCCESS_DURATION } from '../../types/snackbar-durations';
import { UserGroups } from '../../types/user-description.interface';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';

@Component({
  selector: 'app-reset-password-dialog',
  styleUrls: ['./reset-password-dialog.component.scss'],
  templateUrl: './reset-password-dialog.component.html',
})
export class ResetPasswordDialogComponent {

  /**
   * List of all available groups.
   */
   readonly allGroups = [
    'administrator',
    'patient',
    'therapist',
  ];

  /**
   * Indicates if password is hidden.
   */
  hidePassword: boolean = true;

  readonly passwordDefaultLength = environment.passwordPolicy.defaultLength;
  readonly passwordMaxLength = environment.passwordPolicy.maxLength;
  readonly passwordMinLength = environment.passwordPolicy.minLength;
  readonly passwordRule: { allowedChars: string, name: string }[] = environment.passwordPolicy.rule;
  readonly passwordSpecialChars = environment.passwordPolicy.specialChars;

  /**
   * User form.
   */
  readonly userForm = new UntypedFormGroup({
    password: new UntypedFormControl('', [
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
    ]),
    group: new UntypedFormControl(this.data.group, [
      Validators.pattern(this.allGroups.map(g => `[${g}]`).join('|')),
    ]),
  });

  /**
   * Constructs a reset password dialog.
   * @param data Input data.
   * @param dialogRef Dialog reference.
   * @param snackBar Snack bar instance.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { username: string, group: UserGroups },
    private readonly dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private readonly snackBar: MatSnackBar,
  ) { }

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
      this.dialogRef.close({
        password: this.userForm.controls.password.value,
        group: this.userForm.controls.group.value,
      });
    }
  }

  /**
   * Toggles password visibility.
   */
  toggleHidePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}