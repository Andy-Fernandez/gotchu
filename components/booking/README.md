# Booking components

Customer-facing composition for the four-screen public assistant: services, barber preference, date/time, and customer/deposit details. Only the active screen is rendered; compact summaries preserve context without repeating completed sections.

The current checkout is explicitly a local preview. It validates customer inputs and receipt-file metadata in the browser, but it does not create a hold, upload a file, write a booking, or claim a payment. Components consume safe DTOs and do not calculate availability.
