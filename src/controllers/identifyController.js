const prisma = require("../prismaClient");

const handleIdentify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // ============================================================
    // ✅ STEP 1: Validate Request
    // At least one of email or phoneNumber must be present
    // ============================================================
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "At least one of email or phoneNumber is required",
      });
    }

    // ============================================================
    // ✅ STEP 2: Find all contacts matching the email OR phoneNumber
    // ============================================================
    const orConditions = [];
    if (email) orConditions.push({ email: email });
    if (phoneNumber) orConditions.push({ phoneNumber: String(phoneNumber) });

    const matchingContacts = await prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: orConditions,
      },
    });

    // ============================================================
    // ✅ STEP 3: No contacts found → Create a new PRIMARY contact
    // ============================================================
    if (matchingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber ? String(phoneNumber) : null,
          linkPrecedence: "primary",
          linkedId: null,
        },
      });

      return res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // ============================================================
    // ✅ STEP 4: Collect all primary IDs from matching contacts
    // ============================================================
    const primaryIdSet = new Set();

    for (const contact of matchingContacts) {
      if (contact.linkPrecedence === "primary") {
        // This contact itself is primary
        primaryIdSet.add(contact.id);
      } else {
        // This contact is secondary → its linkedId is the primary
        primaryIdSet.add(contact.linkedId);
      }
    }

    // ============================================================
    // ✅ STEP 5: Fetch all primary contacts and find the OLDEST one
    // ============================================================
    const primaryContacts = await prisma.contact.findMany({
      where: {
        id: { in: Array.from(primaryIdSet) },
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    // The true primary = the oldest contact
    const truePrimary = primaryContacts[0];

    // ============================================================
    // ✅ STEP 6: If multiple primaries exist → Demote newer ones
    // This happens when two separate contact groups get linked
    // ============================================================
    if (primaryContacts.length > 1) {
      const contactsToDemote = primaryContacts.slice(1); // All except the oldest

      for (const contact of contactsToDemote) {
        // Demote this primary → make it secondary under truePrimary
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: "secondary",
            linkedId: truePrimary.id,
            updatedAt: new Date(),
          },
        });

        // Also update all contacts that were pointing to this demoted primary
        await prisma.contact.updateMany({
          where: {
            linkedId: contact.id,
            deletedAt: null,
          },
          data: {
            linkedId: truePrimary.id,
            updatedAt: new Date(),
          },
        });
      }
    }

    // ============================================================
    // ✅ STEP 7: Fetch all contacts linked to the true primary
    // ============================================================
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [{ id: truePrimary.id }, { linkedId: truePrimary.id }],
      },
      orderBy: { createdAt: "asc" },
    });

    // ============================================================
    // ✅ STEP 8: Check if incoming request has NEW information
    // If yes → create a new SECONDARY contact
    // ============================================================
    const existingEmails = allLinkedContacts.map((c) => c.email).filter(Boolean);
    const existingPhones = allLinkedContacts.map((c) => c.phoneNumber).filter(Boolean);

    const isNewEmail = email && !existingEmails.includes(email);
    const isNewPhone = phoneNumber && !existingPhones.includes(String(phoneNumber));

    if (isNewEmail || isNewPhone) {
      // New information found → create secondary contact
      await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber ? String(phoneNumber) : null,
          linkedId: truePrimary.id,
          linkPrecedence: "secondary",
        },
      });
    }

    // ============================================================
    // ✅ STEP 9: Fetch final updated list of all contacts
    // ============================================================
    const finalContacts = await prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [{ id: truePrimary.id }, { linkedId: truePrimary.id }],
      },
      orderBy: { createdAt: "asc" },
    });

    // ============================================================
    // ✅ STEP 10: Build and return the final response
    // ============================================================
    const emailsSet = new Set();
    const phonesSet = new Set();
    const secondaryIds = [];

    // Add primary contact's info FIRST
    if (truePrimary.email) emailsSet.add(truePrimary.email);
    if (truePrimary.phoneNumber) phonesSet.add(truePrimary.phoneNumber);

    // Add secondary contacts' info
    for (const contact of finalContacts) {
      if (contact.id !== truePrimary.id) {
        if (contact.email) emailsSet.add(contact.email);
        if (contact.phoneNumber) phonesSet.add(contact.phoneNumber);
        secondaryIds.push(contact.id);
      }
    }

    return res.status(200).json({
      contact: {
        primaryContatctId: truePrimary.id,
        emails: Array.from(emailsSet),
        phoneNumbers: Array.from(phonesSet),
        secondaryContactIds: secondaryIds,
      },
    });

  } catch (error) {
    console.error("❌ Error in /identify:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleIdentify };
