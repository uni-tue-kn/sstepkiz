import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '../../services/auth/auth.service';

import { UserService } from '../../services/user/user.service';
import { SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from '../../types/snackbar-durations';
import { UserDescription, UserGroups } from '../../types/user-description.interface';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';
import { YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-users',
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersComponent implements AfterViewInit, OnInit {

  /**
   * Data source for user table.
   */
  dataSource: MatTableDataSource<UserDescription> = new MatTableDataSource([]);

  /**
   * Columns to display in user table.
   */
  readonly displayedColumns: string[] = ['username', 'group', 'actions'];

  /**
   * User ID of expanded user table row or null if non expanded.
   */
  expandedUserId: string | null = null;

  /**
   * Indicates if results are being loaded.
   */
  isLoadingResults = false;

  /**
   * Input field for filter.
   */
  @ViewChild('filterInput')
  filterInput: ElementRef<HTMLInputElement>;

  /**
   * User table sorter.
   */
  @ViewChild(MatSort)
  userSort: MatSort;

  /**
   * Constructs a new Dashboard Component.
   * @param auth Auth service instance.
   * @param dialog Material dialog reference.
   * @param snackBar Material snack bar reference.
   * @param users User service instance.
   */
  constructor(
    private readonly auth: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly users: UserService,
  ) { }

  /**
   * Applies a search filter for users.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Clears filter.
   */
  clearFilter(): void {
    this.filterInput.nativeElement.value = '';
    this.dataSource.filter = '';
  }

  /**
   * Opens a dialog to create a new user.
   */
  async createUser(): Promise<void> {
    const dialogRef = this.dialog.open(CreateUserDialogComponent);
    const newUser = await dialogRef.afterClosed().toPromise();
    if (!newUser) {
      this.snackBar.open(`User creation canceled`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
      return;
    }
    try {
      this.snackBar.open(`Creating user "${newUser.username}" ...`, 'Dismiss');
      await this.users.createUser(newUser);
      this.snackBar.open(`User "${newUser.username}" created`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
    } catch (error) {
      console.error(error);
      this.snackBar.open(`Failed to create user "${newUser.username}"`, 'Dismiss', { duration: SNACK_BAR_ERROR_DURATION });
    }
  }

  /**
   * Deletes a user.
   * @param user User to remove.
   */
  async deleteUser(user: { username: string, userId: string }): Promise<void> {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: 'Delete User',
        description: `Do you really want to delete user "${user.username}"?`,
      },
    });
    const deleteUser: boolean = await dialogRef.afterClosed().toPromise();
    if (!deleteUser) {
      this.snackBar.open(`User "${user.username}" was not deleted`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
      return;
    }
    try {
      this.snackBar.open(`Deleting user "${user.username}" ...`, 'Dismiss');
      await this.users.deleteUser(user);
      this.snackBar.open(`User "${user.username}" deleted`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
    } catch (error) {
      console.error(error);
      this.snackBar.open(`Failed to remove user "${user.username}"`, 'Dismiss', { duration: SNACK_BAR_ERROR_DURATION });
    };
  }

  /**
   * Loads all users.
   */
  async loadUsers(): Promise<void> {
    this.isLoadingResults = true;
    try {
      this.snackBar.open(`Loading users ...`, 'Dismiss');
      await this.users.findUsers();
      this.snackBar.open('Users loaded', 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to load users', 'Dismiss', { duration: SNACK_BAR_ERROR_DURATION });
    }
    this.isLoadingResults = false;
  }

  /**
   * Initializes UI after view init.
   */
  ngAfterViewInit() {
    this.dataSource.sort = this.userSort;
    this.userSort.direction = 'asc';
    this.userSort.disableClear = true;
    if (this.auth.isAuthenticated) {
      this.loadUsers();
    }
    this.auth.authenticated.subscribe(() => {
      this.loadUsers();
    });
  }

  /**
   * Initializes component.
   */
  ngOnInit(): void {
    this.dataSource.data = this.users.users;
    this.users.usersChange.subscribe(users => {
      this.dataSource.data = users;
    });
  }

  async resetPassword(user: UserDescription): Promise<void> {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      data: { username: user.username, group: user.group },
    });
    const data: { password: string, group: UserGroups } | undefined = await dialogRef.afterClosed().toPromise();
    if (!data) {
      this.snackBar.open(`User "${user.username}" was not updated`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
      return;
    }
    try {
      const newUser: UserDescription = JSON.parse(JSON.stringify(user));
      if (data.password) {
        newUser.password = data.password;
      }
      newUser.group = data.group;
      this.snackBar.open(`Updating user "${user.username}" ...`, 'Dismiss');
      await this.users.editUser(newUser);
      this.snackBar.open(`Updated user "${user.username}"`, 'Dismiss', { duration: SNACK_BAR_SUCCESS_DURATION });
    } catch (error) {
      console.error(error);
      this.snackBar.open(`Failed to update user "${user.username}"`, 'Dismiss', { duration: SNACK_BAR_ERROR_DURATION });
    };
  }
}
