# Aggregator Device Deployment

This deployment guide will start with [Requirements](#0-requirements) for setup.
It continues with the [Initial Setup](#1-initial-setup) of the device's OS and software which must be done for every new device.
The guide finishes with [Patient Setup](#2-patient-setup) which must be done for each patient which uses a device.

## 0. Requirements

- **Target Device**: Surface Pro 7 i7/16GB/256GB
- **Target OS**: Windows 11 (tested on Windows 11 Pro 21H2)

## 1. Initial Setup

This section describes the initial setup of the Aggregator Device.

### 1.1. OS Setup

The following steps can be skipped if your device is already installed.
However, we recommend performing a clean installation of Windows and update it to the latest version.

**Warning 1: This will delete all your data from the Aggregator Device!**

**Warning 2: We recommend connecting the Aggregator Device to DC power!**

1. Perform a clean installation of Windows. This can be done with the Media Creation Tool from [the official website](https://www.microsoft.com/en-us/software-download/windows11) or by [resetting Windows](https://support.microsoft.com/en-us/windows/recovery-options-in-windows-31ce2444-7de3-818c-d626-e3b5a3024da5#WindowsVersion=Windows_11). *Hint: The Surface Pro 7 can boot from plugged in USB devices (such as prepared USB thumb drives with the latest Windows image) by pressing and holding the Volume-Down button during the boot process.*
2. During installation, setup user `sstepkiz-admin`. For more details, see [Administrator Setup](#12-administrator-setup).
3. Install all Windows and Firmware Updates. *Hint: If touchscreen does not work after installation, install drivers from [here](https://support.microsoft.com/en-us/surface/download-drivers-and-firmware-for-surface-09bb2e09-2a4b-cb69-0951-078a7739e120).*
4. Make sure that BitLocker is activated.

### 1.2. Administrator Setup

The following shows how to setup the administrator account.

1. If not yet done, setup an administrator account called `sstepkiz-admin`.
2. Password should be randomly generated using password policy of your organization. We recommend a combination of at least 16 characters containing digits, special, upper, and lower case characters.
3. Document the password in a password manager like [KeePass](https://keepass.info). If you use a different administrator password for each device (recommended), you might also store the serial number of your device. *Hint: The serial number of a Surface Pro is typically placed on the back of the device under the stand directly underneath the Microsoft label.*

### 1.3. Software Setup

1. Copy the script `/deployment/aggregator-device/Easy-Install.ps1` to your Aggregator Device to `C:\Easy-Install.ps1`.
2. Run PowerShell as Administrator and start the script using the following command:
```powershell
PS C:\> PowerShell.exe -NoProfile -ExecutionPolicy bypass -File Easy-Install.ps1
```

When prompted, use the following Git credentials:
- Username: `aggregator-device`
- Password: `rVLr5V9ziUsfhitGAyk5`

3. Restart the device after setup completed.

You might need to configure some sensors and external software after the restart, see [here](/docs/aggregator/sensor-setup.md).


## 2. Patient Setup

This section describes the setup of an individual patient account on the Aggregator Device.

### 2.1. Setup Cloud

1. Create a user to the IMeRa SSO.
2. Login to [Nextcloud](https://nextcloud.example.org/) with IMeRa SSO and use the new patient's credentials.
3. Create a directory in the main directory whose name is equal to the username and share it with all the therapist of the patient.
4. Use Admin UI to configure permissions for the user.

### 2.2. Create Account

1. Login to the administrator account `sstepkiz-admin`.
2. Create a new local Windows user account [see here](https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d).
3. Username must be the same as patient's IMeRa SSO account.
4. Password should be randomly generated using password policy of your organization. We recommend a combination of at least 16 characters containing digits, special, upper, and lower case characters. **This must not, but can be the same password as patient's IMeRa SSO account!**
5. Document the password in a password manager like [KeePass](https://keepass.info).
6. Change account type to Non-Administrator [see here](https://support.microsoft.com/en-us/windows/create-a-local-user-or-administrator-account-in-windows-20de74e0-ac7f-3502-a866-32915af2a34d).

For more user-friendly authentication, it is recommended to let the patient add a custom and at least 6-digit [PIN](https://support.microsoft.com/en-us/windows/change-your-pin-when-you-re-already-signed-in-to-your-device-0bd2ab85-b0df-c775-7aef-1324f2114b19), [Face Recognition, or a Fingerprint](https://support.microsoft.com/en-us/windows/learn-about-windows-hello-and-set-it-up-dae28983-8242-bb2a-d3d1-87c9d265a5f0#ID0EBD=Windows_10) to the account.
The PIN must not be documented, since it can be changed using the password.

### 2.3. Configure Nextcloud

1. Login to patient's Windows Account.
2. Start the Nextcloud client application.
3. Login to server `https://nextcloud.example.org` with IMeRa SSO.
4. Select to synchronize cloud directory `/` to local directory `C:\Users\[patient_user]\sstepkiz\` as virtual directory.
5. Go to Windows Settings app in System > Storage > Storage Optimization, enable weekly cleanup of user content, also for Nextcloud after 14 days.

### 2.4. Configure Sensors

Depending on your sensors, you need to configure some sensors specifically for your patients.
See documentation [here](/docs/aggregator/sensor-setup.md).
