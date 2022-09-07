import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { UserService } from '../../services/user/user.service';
import { SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from '../../types/snackbar-durations';
import { UserDescription } from '../../types/user-description.interface';

@Component({
  selector: 'app-permissions',
  styleUrls: ['./permissions.component.scss'],
  templateUrl: './permissions.component.html',
})
export class PermissionsComponent implements AfterViewInit, OnInit {

  @Input()
  user: UserDescription;

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
   * Columns to display in permission table.
   */
  readonly displayedPermissionColumns: string[] = ['name', 'group', 'ecg', 'etk', 'mov'];

  /**
   * Data source for permission table.
   */
  readonly dataSource: MatTableDataSource<UserDescription> = new MatTableDataSource([]);

  isLoadingResults: boolean = false;

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly users: UserService,
  ) { }

  /**
   * Applies a search filter for permissions.
   */
  applyPermissionFilter(event: Event): void {
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
   * Toggles specific permissions.
   * @param permission Indicates permissions to toggle.
   */
  async togglePermission(permission: { targetId: string, ecg?: boolean, eda?: boolean, etk?: boolean, mov?: boolean }): Promise<void> {
    const current = this.user.permissions?.[permission.targetId] ?? {};
    if (permission.ecg) {
      current.ecg = !current.ecg;
    }
    if (permission.eda) {
      current.eda = !current.eda;
    }
    if (permission.etk) {
      current.etk = !current.etk;
    }
    if (permission.mov) {
      current.mov = !current.mov;
    }
    try {
      const newUserDescription: UserDescription = JSON.parse(JSON.stringify(this.user));
      if (!newUserDescription.permissions) {
        newUserDescription.permissions = {};
      }
      newUserDescription.permissions[permission.targetId] = current;
      const newUser = await this.users.editUser(newUserDescription);
      if (!this.user.permissions) {
        this.user.permissions = {};
      }
      this.user.permissions[permission.targetId] = newUser.permissions?.[permission.targetId];
      this.snackBar.open(
        `Successfully updated permissions of user "${permission.targetId}" to access data of user "${this.user.username}"`,
        'Dismiss',
        { duration: SNACK_BAR_SUCCESS_DURATION },
      );
    } catch (error) {
      console.error(error);
      this.snackBar.open(
        `Failed to update permissions of user "${permission.targetId}" to access data of user "${this.user.username}"`,
        'Dismiss',
        { duration: SNACK_BAR_ERROR_DURATION }
      );
    }
  }

  /**
   * Loads all users.
   */
  async loadUsers(): Promise<void> {
    this.isLoadingResults = true;
    try {
      this.snackBar.open(`Loading users ...`, 'Dismiss');
      const users = await this.users.findUsers();
      this.dataSource.data = users;
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
  ngAfterViewInit(): void {
    this.dataSource.sort = this.userSort;
    this.userSort.direction = 'asc';
    this.userSort.disableClear = true;
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
}
