# Musical Tracker Design Specs

## Goals

- Users track details related to musical performances that they have seen
- Users contribute crowdsourced data related to musicals

## Assumptions

- There are two kinds of users:
  - Regular users
  - Perform all CRUD operations related to their own performances and the details of those performances.
    - Should not have access to performances added by other users
  - Add/edit data related to musicals, e.g. actors, roles, etc.
    - This data is set as pending to be verified by an admin.
  - Admin users
    - Have all regular user capabilities
    - Can view dashboard to verify all pending data added by regular users
- Users authenticate with username and password
- Users can access musical tracker via either an iOS app or a web app

## Technical Details

### App Features

- A user can register for a new account
- A user can login with an existing account
- A user can add a new musical performance
- A user can add/edit details for a past performance they have attended:
- A user can change the following:
  - musicals
  - theaters
  - actors
  - roles
  - castings
- A search bar allows users to pick existing values from the database, regardless of the value’s pending status, or add a new value if it does not exist. Search bar appears for the following entities:
  - musicals
  - theaters
  - actors
  - roles
- A user can see a list of past performances they have attended and tap on a specific performance to see more details
- A user can find other past performances they attended that featured a specific actor
- A user can browse for musicals in the database and see more details on them
- An admin user has access to a dashboard to verify user-submitted data
  - Dashboard will contain actions to verify, edit, or delete pending data
  - An admin user can verify the following entities:
    musicals (include status for use in musical detail screen)
    - theaters (status not needed)
    - actors (status not needed)
    - roles (include status)
  - An admin user can change existing data related to musicals

### App Features (Nice-to-haves)

- Add a tool that finds duplicate entries in the database that most likely refer to the same thing. Tool finds duplicates for the following entities:
  - musicals
  - theaters
  - actors
  - roles
- Give user a way to easily duplicate details for past performances if they go to see the same show twice
- Users can add notes about their experiences, potentially images or other media
- Once admin has verified data in their dashboard, data will have some sort of visual “verified” indicator on the regular user’s end
- Add SIWA for user registration

# Schema changes to be made:

## Users

main change is `ID` goes back to bigint

## Performances

- Now to have:
  - musical id uuid
  - user id bigint
  - notes text
  - poster url varchar

## theaters

- city varchar

## castings

- stays the same

## roles

- musical_id varchar

## actors

- stays the same

## musicals

- stays the same

## productions

- delete whole table

# Endpoints

### Notes for API Development:

Update endpoints should not require all parameters to update objects. Refer to the sheet, optional parameters are clearly marked with a question mark ?.

All update/read/delete endpoints should take in “id” as part of the URL.

For all update endpoints of objects going into the central DB, allow updates if the object is unverified. If the object is verified, require admin access to perform update action.
