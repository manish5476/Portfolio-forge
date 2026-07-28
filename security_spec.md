# Security Specification & Test Payloads

## 1. Data Invariants
- A portfolio document must have a valid `username` matching the document ID path parameter.
- Portfolios can be read publicly so visitors can view developer pages.
- Writes (create/update/delete) are validated to ensure required fields (`id`, `username`, `profile`, `projects`, `achievements`, `updatedAt`) exist and string field sizes are constrained to prevent Denial of Wallet attacks.

## 2. Test Payloads ("Dirty Dozen")
1. **Oversized Username ID Injection**: Attempt to write a document key with a 2KB junk character string.
2. **Missing Required Fields**: Payload omitting `projects` or `profile`.
3. **Ghost / Shadow Fields**: Payload attempting to insert arbitrary unexpected root fields.
4. **Invalid Field Type for Username**: Username submitted as a boolean or number instead of a string.
5. **Oversized String in Bio/Title**: Extremely large string payload exceeding size boundaries.
6. **Unauthenticated Admin Claim Injection**: Client attempts to write custom admin role.
7. **Malformed Array Payload**: Submitting a non-array object for `projects`.
8. **Null Payload Fields**: Submitting `null` for non-nullable required properties.
9. **Path Variable ID Mismatch**: Trying to update `/portfolios/alexdev` with `username: "hacker"`.
10. **Type Mismatch in Theme**: Setting `theme` to a number.
11. **Excessive Unbounded Projects Array**: Submitting 5000 project objects to exhaust storage limit.
12. **Malformed Timestamp String**: Injecting non-string binary data into `updatedAt`.
