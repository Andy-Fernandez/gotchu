# Booking components

Customer-facing composition for the four-screen public assistant: services, barber preference, date/time, and customer/deposit details. Only the active screen is rendered; compact summaries preserve context without repeating completed sections.

The current checkout is explicitly a local preview. It validates customer inputs and receipt-file metadata in the browser, then lets reviewers inspect two separate outcomes: the end-of-flow submission screen and the persistent private booking status. The status prototype can compare `reserved_pending_review` and `confirmed`, but it does not create a hold, upload a file, write a booking, or claim a payment. Components consume safe DTOs and do not calculate availability.

Demo private links carry only a fictional booking snapshot. They contain no customer or receipt data and are not authorization credentials. Production must replace them with an unguessable access token backed by the authoritative booking reader.
