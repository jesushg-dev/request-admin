# Detailed Flow

## Create user and assign roles:

- The system creates an **inactive** user and assigns initial roles.
- Associate the user with a tenant, if necessary from this point.

## Send verification email:

- Send an email with:
  - A **link to verify the email** (unique, secure signature, with expiration).
  - A **tenant access code** (can be the same as the email verification code or a separate code, depending on your needs).

## User verifies email:

- When clicking the email link, the system marks the email as **verified**.
- The user becomes **active**, but **does not have access to the tenant yet**.

## User enters tenant access code:

- The user accesses an interface where they must enter the **provided code**.
- The system validates:
  - That the code is valid and has not expired.
  - That the code is associated with the correct user.
  - That the code is associated with the corresponding tenant.

## User gains access to tenant:

- If the code is valid, the system **activates the user's access** to the tenant and registers them as an authorized member.

## Normal login:

- After these steps, the user can log in to the tenant normally, without needing additional codes.

---

# Flow Advantages

## Enhanced security:

- Email verification ensures the user owns a valid address.
- The additional tenant code guarantees a second level of validation.

## Flexibility:

- Allows handling multiple tenants, as access is managed by specific codes.

## Clear audit trail:

- You can record completed steps (email verified, code entered) for tracking and troubleshooting.

---

# Technical Considerations

## Unique code per tenant:

- Generate a unique code per tenant and user. Optionally, include an **expiration** (e.g., 24-48 hours).
- Store it **encrypted** in the database.

## Clear messages:

- Guide the user through each step with clear messages and reminders of what they need to complete to gain access.

## Recovery options:

- If the user loses the code, provide an option to regenerate or resend it to the registered email.
