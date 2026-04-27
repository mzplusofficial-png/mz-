# Firebase Security Specification

## 1. Data Invariants
- A `User` profile must be created by the authenticated owner and match their UID.
- A `ChatMessage` must belong to a valid `chatId` and have the `senderId` matching the current user.
- A `Notification` can only be created by an Admin (system-level).
- `admins` collection is the source of truth for administrative roles.

## 2. The Dirty Dozen (Test Matrix)
1. **Unauthenticated User Creation**: Attempting to create a user profile without being signed in. (Denied)
2. **Identity Theft (User)**: Attempting to create a user profile for a different UID. (Denied)
3. **Admin Escalation**: Attempting to create an entry in the `admins` collection. (Denied)
4. **Chat Spoofing**: Attempting to send a message with a `senderId` that doesn't match the auth UID. (Denied)
5. **System Notification Injection**: A standard user attempting to create a notification for others. (Denied)
6. **Shadow Update (User)**: Attempting to update the `isAdmin` field in a user profile. (Denied)
7. **Read PII Leak**: A user attempting to read another user's full profile without being an admin. (Denied)
8. **Malicious ID Injection**: Attempting to use a 1MB string as a `userId` or `chatId`. (Denied)
9. **State Shortcut (Chat)**: Attempting to modify a message's `createdAt` to a future date. (Denied)
10. **Query Scraping**: Attempting to list all users without being an admin. (Denied)
11. **Forbidden Deletion**: A standard user attempting to delete another's user profile. (Denied)
12. **Notification Tampering**: A user attempting to modify the `content` of a notification. (Denied)

## 3. Test Runner
*(Conceptual representation for this turn)*
All operations above should return `PERMISSION_DENIED`.
