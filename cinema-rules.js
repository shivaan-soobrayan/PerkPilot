
/* ========================================
   PERKPILOT 3.0
   VERIFIED CINEMA REWARD RULES

   Verified: 9 November 2026
   ======================================== */

const PerkPilotCinema = (() => {

    // Official provider sources
    const sources = {
        sterKinekor:
            "https://www.sterkinekor.com/ster-kinekor-club-terms-and-conditions",

        discovery:
            "https://www.discovery.co.za/vitality/ster-kinekor"
    };

    // SK Club points redemption requirements
    const skClubRewards = [
        {
            name: "Regular popcorn",
            pointsRequired: 400,
            category: "snacks"
        },
        {
            name: "Regular popcorn and soda combo",
            pointsRequired: 800,
            category: "snacks"
        },
        {
            name: "2D or 3D movie ticket",
            pointsRequired: 1000,
            category: "tickets"
        },
        {
            name: "Cine Prestige movie ticket",
            pointsRequired: 1500,
            category: "tickets"
        }
    ];

    function normalise(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    // Identify supported loyalty programmes
    function identifyProgramme(name) {

        const text = normalise(name);

        if (
            text.includes("ster-kinekor") ||
            text.includes("ster kinekor") ||
            text.includes("sk club")
        ) {
            return "sk-club";
        }

        if (text.includes("vitality")) {
            return "discovery-vitality";
        }

        return null;
    }

    // Evaluate one wallet account
    function evaluateAccount(account) {

        if (!account || !account.programme) {
            return null;
        }

        const programmeType =
            identifyProgramme(account.programme);

        const balance = Number(account.points);

        if (
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            return null;
        }

        // SK CLUB: POINTS-BASED REDEMPTIONS
        if (programmeType === "sk-club") {

            const rewards = skClubRewards.map(reward => {

                const enoughPoints =
                    balance >= reward.pointsRequired;

                return {
                    ...reward,

                    enoughPoints,

                    pointsMissing: Math.max(
                        0,
                        reward.pointsRequired - balance
                    ),

                    status: enoughPoints
                        ? "Balance meets points requirement"
                        : "Not enough points"
                };
            });

            return {
                programme: account.programme,
                type: "points",

                enteredBalance: balance,

                rewards,

                otherBenefits: [
                    "50% off qualifying tickets on Tuesdays for eligible SK Club members"
                ],

                importantNotes: [
                    "Your balance is user-entered, not verified with Ster-Kinekor.",
                    "A qualifying balance does not guarantee an available ticket or reward.",
                    "Points cannot be partly combined with a cash payment.",
                    "Points generally expire 12 months after being earned.",
                    "Points cannot generally be combined with other promotions.",
                    "3D glasses are excluded from ticket redemptions."
                ],

                source: sources.sterKinekor
            };
        }

        // DISCOVERY: MEMBERSHIP BENEFITS
        // NOT A DIRECT POINTS REDEMPTION
        if (programmeType === "discovery-vitality") {

            return {
                programme: account.programme,

                type: "membership-discount",

                enteredBalance: balance,

                rewards: [
                    {
                        name: "2D movie ticket",
                        discountPercent: 50
                    },
                    {
                        name: "3D movie ticket",
                        discountPercent: 50
                    },
                    {
                        name: "Cinema Nouveau ticket",
                        discountPercent: 50
                    },
                    {
                        name: "IMAX ticket",
                        discountPercent: 25
                    },
                    {
                        name: "Cine Prestige ticket",
                        discountPercent: 25
                    },
                    {
                        name: "NT Live ticket",
                        discountPercent: 25
                    }
                ],

                importantNotes: [
                    "This is a membership discount, not a points redemption.",
                    "Your entered points balance does not determine qualification.",
                    "An eligible Vitality membership and activated cinema benefit are required.",
                    "The discount applies only to qualifying bookings.",
                    "The same movie cannot normally be watched twice at the Vitality rate.",
                    "SK Club and Vitality discounts cannot be combined."
                ],

                source: sources.discovery
            };
        }

        // Other programmes are not verified yet
        return null;
    }

    // Evaluate all saved wallet accounts
    function evaluateWallet(accounts) {

        if (!Array.isArray(accounts)) {
            return [];
        }

        return accounts
            .map(evaluateAccount)
            .filter(Boolean);
    }

    return {
        identifyProgramme,
        evaluateAccount,
        evaluateWallet,
        sources
    };

})();
